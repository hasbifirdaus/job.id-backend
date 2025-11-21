-- CreateTable
CREATE TABLE "PageViews" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "job_id" INTEGER,
    "views" INTEGER NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageViews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageViews_company_id_idx" ON "PageViews"("company_id");

-- CreateIndex
CREATE INDEX "PageViews_job_id_idx" ON "PageViews"("job_id");

-- AddForeignKey
ALTER TABLE "PageViews" ADD CONSTRAINT "PageViews_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageViews" ADD CONSTRAINT "PageViews_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
