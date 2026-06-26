ALTER TABLE "transaction" ADD COLUMN "content_hash" text;--> statement-breakpoint
CREATE INDEX "transaction_userId_contentHash_idx" ON "transaction" USING btree ("user_id","content_hash");