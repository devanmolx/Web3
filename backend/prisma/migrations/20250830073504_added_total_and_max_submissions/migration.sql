-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "maxSubmissions" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "totalSubmissions" INTEGER NOT NULL DEFAULT 0;
