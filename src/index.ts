import { Elysia } from "elysia";
import { db } from "./database";
import { sql } from "drizzle-orm";

const app = new Elysia()
	.decorate("db", db)
	.onStart(async () => {
		try {
			await db.execute(sql`SELECT 1`);
			console.log("Database 1");
		} catch (error: unknown) {
			console.error("Database 0 :", String(error));
			process.exit(1);
		}
	})
	.get("/", () => "Hello Elysia")
	.listen(3000);

console.log(`Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
