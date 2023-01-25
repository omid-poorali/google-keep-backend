import { Request, Response } from "express";
import JWT, { JsonWebTokenError } from "jsonwebtoken";
import { Enums, Errors } from "commons";

type Result = {
    status: Enums.HTTPStatus;
    message?: string;
    data?: any;
}

type Handler = (req: Request, res: Response) => (Result | Promise<Result>);


type account = {
    account: string;
    role?: string[];
}

type SystemRoute = {
    method: Enums.HTTPMethod;
    path: string;
    handler: (req: Request, res: Response) => void;
}

type RouteType = {
    method: Enums.HTTPMethod;
    path: string;
    role: Enums.Role[];
    handler: Handler;
}

export const useRouter = ({ method, path, role, handler }: RouteType): SystemRoute => {

    const routeHandler = async (req: Request, res: Response) => {
        try {
            // check if the role required for api
            if (role.some((r: Enums.Role) => [Enums.Role.ADMIN, Enums.Role.USER].includes(r))) {
                const token = req.headers.authorization;
                if (token) {
                    const payload = JWT.verify(token, process.env.JWT_SECRET ?? "") as account;
                    // user do not allow to access this resource
                    if (role.some(r => !(payload.role ?? []).includes(r))) {
                        return res.status(Enums.HTTPStatus.FORBIDDEN).json({
                            message: Errors.FORBIDDEN
                        });
                    }
                    req.payload = payload;
                } else {
                    return res.status(Enums.HTTPStatus.UNAUTHORIZED).json({
                        message: Errors.UNAUTHENTICATED
                    });
                }
            }

            const result = await handler(req, res);

            if (!result.message) {
                switch (result.status) {
                    case Enums.HTTPStatus.SUCCESS:
                        result.message = "success";
                        break;
                    case Enums.HTTPStatus.BAD_REQUEST:
                        result.message = Errors.INVALID_INPUT;
                        break;
                    default:
                        result.message = Errors.INTERNAL_SERVER_ERROR;
                }
            }

            res.status(result.status).json({
                message: result.message,
                data: result.data
            });

        } catch (error) {
            console.error(error);
            if (error instanceof JsonWebTokenError) {
                res.status(Enums.HTTPStatus.UNAUTHORIZED).json({
                    message: Errors.UNAUTHENTICATED
                });
            }
            else {
                res.status(Enums.HTTPStatus.INTERNAL_SERVER_ERROR).json({
                    message: Errors.INTERNAL_SERVER_ERROR
                });
            }
        }
    }

    return {
        method,
        path,
        handler: routeHandler
    }
};