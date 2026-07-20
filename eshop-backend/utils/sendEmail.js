import { transporter } from "../config/nodemailer.js";

export const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"E-Shop" <${process.env.EMAIL}>`,
    to,
    subject,
    html,
  });
};
