CREATE TABLE "keyval" (
	"key" varchar(255) PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"ttl" timestamp
);
--> statement-breakpoint
CREATE INDEX "key_idx" ON "keyval" USING btree ("key");--> statement-breakpoint
CREATE INDEX "ttl_idx" ON "keyval" USING btree ("ttl");