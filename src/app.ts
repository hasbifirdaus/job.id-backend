import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routers/auth/auth.routes";
import preSelectionRoutes from "./routers/preSelection/preSelection.routes";
import jobRoutes from "./routers/job-posting-management/job/job.routes";
import tagRoutes from "./routers/job-posting-management/tag/tag.routes";
import categoryRoutes from "./routers/job-posting-management/category/category.routes";
import provinceRoutes from "./routers/job-posting-management/province/province.routes";
import cityRoutes from "./routers/job-posting-management/city/city.routes";
import applicationsRoutes from "./routers/applications/applications.routes";
import applicantRoutes from "./routers/applicant-management/applicant.routes";
import interviewRoutes from "./routers/interview/interview.routes";
import analyticsRoutes from "./routers/website-analytics/analytics.routes";
import { scheduleInterviewReminder } from "./lib/cron/interviewReminder";
import userRoutes from "./routers/users-jobseeker/user.routes";
import userJobRoutes from "./routers/job-and-company-discovery/jobs/job.routes";
import companyRoutes from "./routers/job-and-company-discovery/companies/company.routes";
import jobPostingRoutes from "./routers/job-posting/jobs.routes";
import uploadRoutes from "./routers/job-posting/upload-banner/upload.routes";
import profileRoutes from "./routers/user-authentication-and-profiles/user-profile/profile.routes";
import applyListRoutes from "./routers/apply-list-and-detail/apply.list.routes";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/province", provinceRoutes);
app.use("/api/city", cityRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/preselection", preSelectionRoutes);
app.use("/api/applyjob", applicationsRoutes);
app.use("/api/applicantmanagement", applicantRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", userJobRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/jobPosting", jobPostingRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/applyList", applyListRoutes);

scheduleInterviewReminder();

//Error handler middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: err?.message,
    data: [],
  });
});

export default app;
