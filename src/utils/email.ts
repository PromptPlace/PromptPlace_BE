import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendVerificationEmail = async (to: string, code: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // e.g., smtp.gmail.com
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === "true", // TLS 사용 여부
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"PromptPlace" <${process.env.EMAIL_USER}>`,
    to,
    subject: "이메일 인증번호 안내",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>이메일 인증</h2>
        <p>아래 인증번호를 입력해주세요.</p>
        <h3 style="color: #0066ff;">${code}</h3>
        <p style="color: #888;">본 인증번호는 5분간 유효합니다.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};