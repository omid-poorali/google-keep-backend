export enum HTTPStatus {
    SUCCESS = 200,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}

export enum HTTPMethod {
    GET = "get",
    POST = "post",
    PUT = "put",
    DELETE = "delete"
}

export enum EmailStatus {
    UNVERIFIED = "UNVERIFIED",
    VERIFIED = "VERIFIED"
}


export enum Role {
    ADMIN = "ADMIN",
    USER = "USER"
}