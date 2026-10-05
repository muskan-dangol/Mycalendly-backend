import nodemailer from "nodemailer";

export const sendEmail = async ({
  email,
  subject,
  html,
  message,
}: {
  email: string;
  subject: string;
  html: string;
  message: string;
}) => {
  const host = process.env.SMTP_HOST;
  if (!host) {
    throw new Error("Environment variable SMTP_HOST is not set");
  }

  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  if (isNaN(port)) {
    throw new Error("Environment variable SMTP_PORT is not a valid number");
  }

  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";

  const fromVar = process.env.SMTP_FROM;
  if (!fromVar) {
    throw new Error("Environment variable SMTP_FROM is not set");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: host,
    port: port,
    secure: false,
    auth: {
      user: user,
      pass: pass,
    },
  });
  const from = fromVar;
  const mailOptions = {
    from: `${from} <${from}>`,
    to: email,
    subject: subject,
    html: html,
    text: message,
  };

  await transporter.sendMail(mailOptions);
};
