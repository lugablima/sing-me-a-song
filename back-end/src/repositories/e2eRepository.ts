import { prisma } from "../database";

async function truncate() {
	await prisma.$executeRaw`TRUNCATE TABLE recommendations RESTART IDENTITY`;
}

export const e2eRepository = {
	truncate,
};
