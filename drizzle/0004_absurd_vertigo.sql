ALTER TABLE "csv_import" ADD COLUMN "bank" text;--> statement-breakpoint
ALTER TABLE "csv_import" ADD COLUMN "account_type" text;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "bank" text;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "account_type" text;