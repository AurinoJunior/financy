CREATE TABLE "financial_plan" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"essential_pct" integer DEFAULT 50 NOT NULL,
	"non_essential_pct" integer DEFAULT 30 NOT NULL,
	"patrimony_pct" integer DEFAULT 20 NOT NULL,
	"simulation_income" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "financial_plan_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "financial_plan" ADD CONSTRAINT "financial_plan_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;