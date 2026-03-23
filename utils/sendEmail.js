import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    process.stdout.write("\n📧 Preview URL: " + nodemailer.getTestMessageUrl(info) + "\n");

  } catch (err) {
    process.stderr.write("\n❌ Email failed: " + err.message + "\n");
    throw err;
  }
};