// modules/interview/interview.reminder.cron.ts
import cron from "node-cron";
import * as service from "./interview.service";
import {
  tryAcquireAdvisoryLock,
  releaseAdvisoryLock,
} from "./interview.repository";

/**
 * REMINDER_LOCK_KEY: choose a stable bigint key for advisory lock
 * Keep constant across all service instances.
 */
const REMINDER_LOCK_KEY = 987654321n; // BigInt for clarity

function getCronExpressionFromEnv(): string {
  const reminderTime = process.env.REMINDER_TIME || "08:00";
  const parts = String(reminderTime).split(":");
  if (parts.length !== 2) {
    console.warn(
      `Invalid REMINDER_TIME (${reminderTime}), defaulting to 08:00`
    );
    return "0 8 * * *";
  }

  const [hourStr, minuteStr] = parts;
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    console.warn(
      `Invalid REMINDER_TIME (${reminderTime}), defaulting to 08:00`
    );
    return "0 8 * * *";
  }

  // cron format: minute hour ...
  return `${minute} ${hour} * * *`;
}

export const scheduleInterviewReminder = () => {
  // --- (NONAKTIFKAN PENJADWALAN OTOMATIS) ---
  const cronExpr = getCronExpressionFromEnv();
  const timezone = process.env.REMINDER_TZ || "Asia/Jakarta"; // optional env override
  console.log("Scheduling interview reminder cron:", cronExpr, "tz:", timezone);

  cron.schedule(
    cronExpr,
    async () => {
      console.log(`[cron] Trying to acquire lock ${REMINDER_LOCK_KEY} ...`);
      let acquired = false;
      try {
        // tryAcquireAdvisoryLock expects a number in your repo; if repo accepts bigint adapt it.
        acquired = await tryAcquireAdvisoryLock(Number(REMINDER_LOCK_KEY));
        if (!acquired) {
          console.log(
            "[cron] Lock not acquired - another instance is running the job. Skipping run."
          );
          return;
        }
        console.log("[cron] Lock acquired. Running reminders...");

        // compute tomorrow in server local timezone — if you need a specific tz, ensure cron runs with that tz option
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const start = new Date(tomorrow);
        start.setHours(0, 0, 0, 0);
        const end = new Date(tomorrow);
        end.setHours(23, 59, 59, 999);

        try {
          const result = await service.sendRemindersForDateRange(start, end);
          console.log(
            `[cron] Reminders sent for ${result?.count ?? 0} interviews.`
          );
        } catch (serviceErr) {
          console.error(
            "[cron] service.sendRemindersForDateRange failed:",
            serviceErr
          );
        }
      } catch (err) {
        console.error("[cron] Error running reminder:", err);
      } finally {
        if (acquired) {
          try {
            await releaseAdvisoryLock(Number(REMINDER_LOCK_KEY));
            console.log("[cron] Lock released.");
          } catch (e) {
            console.error("[cron] Failed to release lock:", e);
          }
        }
      }
    },
    {
      scheduled: true,
      timezone,
    }
  );
  // -------test manual---------

  // export const runInterviewReminderManually = async () => {
  //   console.log("Running Interview Reminder Job Manually...");
  //   await reminderJobLogic();
};
