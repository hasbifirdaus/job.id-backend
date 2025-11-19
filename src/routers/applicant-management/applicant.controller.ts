import { Request, Response } from "express";
import {
  findApplicantsByJob,
  findApplicationDetail,
  changeApplicationStatus,
  getCvPathByApplicationId,
} from "./applicant.service";
import cloudinary from "../../lib/config/claudinary";

export const getApplicantsByJob = async (req: Request, res: Response) => {
  try {
    const validatedQuery = (req as any).validatedQuery as {
      name?: string;
      education?: string;
      minAge?: number;
      maxAge?: number;
      expected_salary?: number;
      page: number;
      limit: number;
      sortKey: string;
      sortOrder: "asc" | "desc";
    };

    const jobId = Number(req.params.jobId);

    // 2. Destructure parameter dari validatedQuery (bukan req.query)
    const {
      name,
      minAge,
      maxAge,
      education,
      expected_salary,
      page,
      limit,
      sortKey,
      sortOrder,
    } = validatedQuery;

    console.log("[DEBUG] Validated Query Params:", validatedQuery);

    const allowedSortKeys = [
      "created_at",
      "user_name",
      "user_dob",
      "expected_salary",
    ] as const;

    function isSortKey(value: any): value is (typeof allowedSortKeys)[number] {
      return allowedSortKeys.includes(value);
    }

    const sortKeyValidated = isSortKey(sortKey) ? sortKey : "created_at";

    const { applicants, total } = await findApplicantsByJob(
      jobId,
      page,
      limit,
      sortKeyValidated,
      sortOrder,
      name,
      minAge,
      maxAge,
      education,
      expected_salary
    );

    res.json({
      message: "Applicants fetched successfully",
      applicants,
      total,
      page,
      limit,
    });
  } catch (err: any) {
    // Sebaiknya, tambahkan logging error detail di server side untuk debug
    console.error("[ERROR] getApplicantsByJob failed:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
};

export const getApplicationDetail = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const application = await findApplicationDetail(id);

    if (!application) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    res.json({
      message: "Application detail fetched successfully",
      application,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status, notes } = req.body;
    const adminId = (req as any).user.id;

    const updated = await changeApplicationStatus(id, status, adminId, notes);

    res.json({
      message: "Application status updated successfully",
      application: updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getSignedCvUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const applicationId = Number(req.params.id);

    if (isNaN(applicationId)) {
      res.status(400).json({ error: "Application ID tidak valid." });
      return;
    }

    const cvPath = await getCvPathByApplicationId(applicationId);

    if (!cvPath) {
      res.status(404).json({ error: "CV tidak ditemukan." });
      return;
    }

    const signedUrl = cloudinary.url(cvPath, {
      secure: true,
      resource_type: "raw",
      format: "pdf",
      type: "upload",
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      flags: "fl_attachment:false",
    });

    res.json({
      message: "Signed CV URL generated successfully",
      signedUrl,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: err.message || "Gagal membuat link CV yang aman." });
  }
};
