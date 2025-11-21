import { InterviewType as PrismaInterviewType } from "../generated/prisma";

export type InterviewType = "ONLINE" | "OFFLINE" | "HYBRID";

export interface InterviewScheduleInput {
  application_id: number;
  schedule_date: Date | string;
  interview_type: InterviewType;
  meeting_link?: string | null;
  location?: string | null;
  notes?: string | null;
}

export interface BulkScheduleInput {
  schedules: InterviewScheduleInput[];
}

export interface InterviewUpdateInput {
  schedule_date?: string;
  interview_type?: InterviewType;
  meeting_link?: string | null;
  location?: string | null;
  notes?: string | null;
}
