import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: Number(process.env.EMAIL_PORT),

//   secure: Number(process.env.EMAIL_PORT) === 465, // true untuk SSL
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 2525,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface ISendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: ISendEmailParams) => {
  try {
    const info = await transporter.sendMail({
      from: `"Job Board App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent to ${to} - MessageID: ${info.messageId}`);
    return info;
  } catch (error: any) {
    console.error("[Email] Failed sending email", {
      error: error.message,
      response: error.response,
    });
    throw new Error("Failed to send email notification");
  }
};
