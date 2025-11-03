import cron from "node-cron";
import prisma from "../../lib/config/prisma";
import { sendEmail } from "../utils/sendEmail";

function getCronExpressionFromEnv(): string {
  const reminderTime = process.env.REMINDER_TIME || "08:00";
  const [hourStr, minuteStr] = reminderTime.split(":");

  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (
    isNaN(hour) ||
    isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    console.warn(
      `Invalid REMINDER_TIME format (${reminderTime}), defaults to 08:00`
    );
    return "0 8 * * *";
  }

  return `${minute} ${hour} * * *`;
}

export const scheduleInterviewReminder = () => {
  const cronExpression = getCronExpressionFromEnv(); //"*/1 * * * *"

  console.log(
    `Interview reminders are scheduled every ${process.env.REMINDER_TIME || "08:00"}`
  );

  cron.schedule(cronExpression, async () => {
    console.log("Running interview reminder cron...");

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
      const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

      const interviews = await prisma.interviews.findMany({
        where: {
          schedule_date: {
            gte: startOfTomorrow,
            lte: endOfTomorrow,
          },
        },
        include: {
          application: {
            include: {
              user: true,
              job: { include: { company: true } },
            },
          },
        },
      });

      if (interviews.length === 0) {
        console.log("There is no interview for tomorrow.");
        return;
      }

      for (const interview of interviews) {
        const { application, schedule_date } = interview;
        const { user, job } = application;

        const interviewDate = new Date(schedule_date).toLocaleString("id-ID", {
          dateStyle: "full",
          timeStyle: "short",
        });

        const subject = `Reminder Interview: ${job.title} at ${job.company.name}`;
        const html = `
  <p>Hello <b>${user.name}</b>,</p>

  <p>
    This is a reminder that you have an interview scheduled tomorrow 
    (<b>${interviewDate}</b>) for the position 
    <b>${job.title}</b> at company <b>${job.company.name}</b>.
  </p>

  <p>
    Good luck and don't forget to prepare as best as you can!
  </p>

  <p>
    Warm regards,<br />
    <b>Team Job App</b>
  </p>
`;

        await sendEmail({
          to: user.email,
          subject,
          html,
        });

        console.log(`Reminder successfully sent to ${user.email}`);
      }
      console.log("The cron reminder has finished running.");
    } catch (err) {
      console.error("Error in cron reminder:", err);
    }
  });
};
