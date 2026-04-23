const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  return transporter;
};

const sendMail = async ({ to, subject, html }) => {
  const mailer = getTransporter();

  if (!mailer) {
    console.log(`[MAIL STUB] To: ${to} | Subject: ${subject}`);
    console.log(`[MAIL STUB] Body: ${html}\n`);
    return { stub: true };
  }

  const info = await mailer.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    html
  });

  return info;
};

const sendWelcomeEmail = async (user) => {
  await sendMail({
    to: user.email,
    subject: "Welcome to EduLaunch!",
    html: `
      <h2>Welcome, ${user.name}!</h2>
      <p>Your account has been created as a <strong>${user.role}</strong>.</p>
      <p>Start exploring courses or create your own today on EduLaunch.</p>
    `
  });
};

const sendEnrollmentEmail = async (user, course) => {
  await sendMail({
    to: user.email,
    subject: `Enrollment Confirmed: ${course.title}`,
    html: `
      <h2>You're enrolled!</h2>
      <p>Hi ${user.name}, you have successfully enrolled in <strong>${course.title}</strong>.</p>
      <p>Amount Paid: ₹${course.price}</p>
      <p>Head to your dashboard to start learning.</p>
    `
  });
};

module.exports = { sendMail, sendWelcomeEmail, sendEnrollmentEmail };
