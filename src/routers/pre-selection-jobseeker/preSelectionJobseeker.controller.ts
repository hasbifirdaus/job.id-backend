// controllers/preSelection/preSelection.controller.ts
import { Request, Response } from "express";
import { PreSelectionService } from "./preSelectionJobseeker.service";

export const getTestForJobseekerController = async (
  req: Request,
  res: Response
) => {
  try {
    const jobId = Number(req.params.jobId);
    const test = await PreSelectionService.getTestForJob(jobId);
    if (!test) return res.status(404).json({ error: "Test not found" });
    const safeQuestions = test.questions.map((q) => ({
      id: q.id,
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
    }));
    return res.json({
      data: {
        id: test.id,
        title: test.title,
        status: test.status,
        questions: safeQuestions,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const submitPreSelectionTestController = async (
  req: Request,
  res: Response
) => {
  try {
    const applicationId = Number(req.params.applicationId);
    const answers = req.body.answers || [];
    const result = await PreSelectionService.submitTest(applicationId, answers);
    return res.json({ message: "Submitted", result });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

export const savePreSelectionProgressController = async (
  req: Request,
  res: Response
) => {
  try {
    const applicationId = Number(req.params.applicationId);
    const answers = req.body.answers || [];
    const updated = await PreSelectionService.saveProgress(
      applicationId,
      answers
    );
    return res.json({
      message: "Progress saved",
      updatedAt: updated.updated_at,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

export const getPreSelectionResultController = async (
  req: Request,
  res: Response
) => {
  try {
    const applicationId = Number(req.params.applicationId);
    const data =
      await PreSelectionService.getResultByApplication(applicationId);
    return res.json({ data });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};
