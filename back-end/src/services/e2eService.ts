import { e2eRepository } from "../repositories/e2eRepository";

async function reset() {
	await e2eRepository.truncate();
}

export const e2eService = {
	reset,
};
