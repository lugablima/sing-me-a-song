import { Request, Response } from "express";
import { e2eService } from "../services/e2eService";

async function reset(req: Request, res: Response) {
	await e2eService.reset();
	res.sendStatus(200);
}

export const e2eController = {
	reset,
};
