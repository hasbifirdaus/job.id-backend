import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routers/auth/auth.routes";
import preSelectionRoutes from "./routers/preSelection/preSelection.routes";
import jobRoutes from "./routers/job/job.routes";
import tagRoutes from "./routers/tag/tag.routes";
import categoryRoutes from "./routers/category/category.routes";
import provinceRoutes from "./routers/province/province.routes";
import cityRoutes from "./routers/city/city.routes";
import applicationsRoutes from "./routers/applications/applications.routes";
import applicantRoutes from "./routers/applicant-management/applicant.routes";
import interviewRoutes from "./routers/interview/interview.routes";
import analyticsRoutes from "./routers/website-analytics/analytics.routes";
import { scheduleInterviewReminder } from "./lib/cron/interviewReminder";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000", // asal frontend
    credentials: true, // izinkan cookie / header auth
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
