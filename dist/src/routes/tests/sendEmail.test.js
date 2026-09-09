#!/usr/bin/env node
import nodemailer from 'nodemailer';

(async () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;
  const to = process.env.TEST_TO || user;

  if (!user || !pass) {
    console.error('Missing SMTP_USER or SMTP_PASS. Set them in your .env (use an App Password).');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host,
    port,
    secure: false,
    auth: { user, pass },
    logger: true,
    debug: true,
  });
  try {
    await transporter.verify();
    console.log('SMTP connection verified — proceeding to send email');
    const info = await transporter.sendMail({
      from,
      to,
      subject: 'Test email from oauth-integration',
      text: 'This is a test email sent using Gmail App Password.',
    });
    console.log('Test email sent:', info.messageId || info.response);
  } catch (err) {
    console.error('Error verifying/sending test email:', err);
    process.exit(1);
  }
})();
