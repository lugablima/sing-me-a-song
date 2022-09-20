import { NextFunction, Request, Response } from "express";
import { AppError, errorTypeToStatusCode, isAppError } from "../utils/errorUtils.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandlerMiddleware(err: Error | AppError, req: Request, res: Response, next: NextFunction) {
	console.log(err);

	if (isAppError(err)) {
		return res.status(errorTypeToStatusCode(err.type)).send(err.message);
	}

	return res.sendStatus(500);
}
