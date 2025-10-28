import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendVerificationEmail = async (to: string, code: string) => {
    
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_APP_PASSWORD; 

  if (!emailUser || !emailPass) {
      throw new Error("SMTP 인증 정보(EMAIL_USER 또는 EMAIL_APP_PASSWORD)가 환경 변수에 설정되지 않았습니다.");
  }
  
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", 
    port: 587,
    secure: false, 
    auth: {
      user: emailUser, 
      pass: emailPass, 
    },
    requireTLS: true, 
  });

  const mailOptions = {
    from: `"PromptPlace" <${emailUser}>`,
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

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 이메일 발송 오류";
    throw new Error(`이메일 발송에 실패했습니다: ${errorMessage}`);
  }
};