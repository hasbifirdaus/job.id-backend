import { sendEmail as sendEmailLib } from "../../lib/utils/sendEmail";

export const sendInterviewNotificationToApplicant = async (opts: {
  user: { email: string; name: string };
  job: { title: string; company: { name: string } };
  schedule_date: Date | string;
  interview_type: string;
  meeting_link?: string | null;
  location?: string | null;
}) => {
  const { user, job, schedule_date, interview_type, meeting_link, location } =
    opts;
  const interviewDate = new Date(schedule_date).toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const html = `
    <h3>Interview Invitation</h3>
    <p>Hi ${user.name},</p>
    <p>Your interview for <b>${job.title}</b> at <b>${job.company.name}</b> has been scheduled on <b>${interviewDate}</b>.</p>
    <p>Type: ${interview_type}</p>
    ${
      (interview_type === "ONLINE" || interview_type === "HYBRID") &&
      meeting_link
        ? `<p>Meeting Link: <a href="${meeting_link}">${meeting_link}</a></p>`
        : ""
    }
    ${
      (interview_type === "OFFLINE" || interview_type === "HYBRID") && location
        ? `<p>Location: ${location}</p>`
        : ""
    }
    <p>Good luck!</p>
  `;

  return sendEmailLib({
    to: user.email,
    subject: `Interview Schedule: ${job.title} - ${job.company.name}`,
    html,
  });
};

export const sendInterviewUpdatedNotificationToApplicant = async (opts: {
  user: { email: string; name: string };
  job: { title: string; company: { name: string } };
  schedule_date: Date | string;
  interview_type: string;
  meeting_link?: string | null;
  location?: string | null;
}) => {
  // similar template, separate subject
  const { user, job, schedule_date, interview_type, meeting_link, location } =
    opts;
  const interviewDate = new Date(schedule_date).toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const html = `
    <h3>Interview Schedule Updated</h3>
    <p>Hi ${user.name},</p>
    <p>Your interview for <b>${job.title}</b> at <b>${job.company.name}</b> has been updated.</p>
    <p><b>New date:</b> ${interviewDate}</p>
    <p><b>Type:</b> ${interview_type}</p>
    ${
      (interview_type === "ONLINE" || interview_type === "HYBRID") &&
      meeting_link
        ? `<p>Meeting Link: <a href="${meeting_link}">${meeting_link}</a></p>`
        : ""
    }
    ${
      (interview_type === "OFFLINE" || interview_type === "HYBRID") && location
        ? `<p>Location: ${location}</p>`
        : ""
    }
    <p>Please contact the company if you have any questions.</p>
  `;

  return sendEmailLib({
    to: user.email,
    subject: `Interview Updated: ${job.title} - ${job.company.name}`,
    html,
  });
};

/**
 * Admin reminder email helper
 */
export const sendAdminReminderEmails = async (opts: {
  companyEmail?: string | null;
  adminEmails: string[];
  jobTitle: string;
  companyName: string;
  candidateName: string;
  interviewDateStr: string;
}) => {
  const {
    companyEmail,
    adminEmails,
    jobTitle,
    companyName,
    candidateName,
    interviewDateStr,
  } = opts;

  const adminHtml = `
    <p>Hello Admin,</p>
    <p>There is an interview scheduled tomorrow with candidate <b>${candidateName}</b>.</p>
    <p>Date: <b>${interviewDateStr}</b></p>
    <p>Position: <b>${jobTitle}</b></p>
    <p><b>Team Job App</b></p>
  `;

  const subject = `Reminder Interview: ${jobTitle} at ${companyName}`;

  const promises: Promise<any>[] = [];

  if (companyEmail) {
    promises.push(
      sendEmailLib({
        to: companyEmail,
        subject: `[ADMIN REMINDER] ${subject}`,
        html: adminHtml,
      })
    );
  }

  for (const email of adminEmails) {
    promises.push(
      sendEmailLib({
        to: email,
        subject: `[ADMIN REMINDER] ${subject}`,
        html: adminHtml,
      })
    );
  }

  return Promise.allSettled(promises);
};

export const sendInterviewReminderToApplicant = async (opts: {
  user: { email: string; name: string };
  job: { title: string; company: { name: string } };
  schedule_date: Date | string;
  interview_type: string;
  meeting_link?: string | null;
  location?: string | null;
}) => {
  const { user, job, schedule_date, interview_type, meeting_link, location } =
    opts;

  const interviewDate = new Date(schedule_date).toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const html = `
    <h3>Reminder Interview</h3>
    <p>Hi ${user.name},</p>
    <p>Ini adalah pengingat bahwa kamu memiliki interview untuk posisi <b>${job.title}</b> di <b>${job.company.name}</b>.</p>
    <p><b>Jadwal:</b> ${interviewDate}</p>
    <p><b>Tipe:</b> ${interview_type}</p>

    ${
      (interview_type === "ONLINE" || interview_type === "HYBRID") &&
      meeting_link
        ? `<p><b>Meeting Link:</b> <a href="${meeting_link}">${meeting_link}</a></p>`
        : ""
    }

    ${
      (interview_type === "OFFLINE" || interview_type === "HYBRID") && location
        ? `<p><b>Location:</b> ${location}</p>`
        : ""
    }

    <p>Semoga berhasil!</p>
  `;

  return sendEmailLib({
    to: user.email,
    subject: `Reminder Interview: ${job.title} - ${job.company.name}`,
    html,
  });
};
