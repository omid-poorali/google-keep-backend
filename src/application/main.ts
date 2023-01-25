import path from "path";
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors, { CorsOptions } from "cors";
import { Enums } from "commons";
import * as Routes from "routes";

declare global {
    namespace Express {
        interface Request {
            payload: {
                account: string;
            }
        }
    }
}

export const application = (): Application => {

    expand(config({
        path: path.resolve(process.cwd(), ".env")
    }));

    const app: Application = express();
    app.use(morgan('dev'));
    app.use(cookieParser());

    // parse requests of content-type - application/json
    app.use(express.json());

    // parse requests of content-type - application/x-www-form-urlencoded
    app.use(express.urlencoded({ extended: true }));

    mongoose.connect(process.env.CONNECTION_STRING as string).then(() => {
        console.log("Successfully connect to DB");
    }).catch(err => {
        console.error("DB Connection error", err);
        process.exit();
    });

    mongoose.set('toJSON', {
        virtuals: true,
        transform: (doc, converted) => {
            delete converted._id;
        }
    });

    const corsOptions: CorsOptions = {
        allowedHeaders: [
            "Origin",
            "Content-Type",
            "Authorization"
        ],
        origin: process.env.DOMAIN,
        credentials: true
    };

    // enable cors
    app.use(cors(corsOptions));

    for (const route of Routes.all) {
        app[route.method](`/api${route.path}`, route.handler);
    }

    app.use("*", (req: Request, res: Response) => {
        res.status(Enums.HTTPStatus.NOT_FOUND).json({
            message: "not found"
        });
    });

    return app;
}