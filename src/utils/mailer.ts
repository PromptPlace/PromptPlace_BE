import nodemailer, { Transporter } from "nodemailer";

/**
 * 범용 메일 발송 유틸.
 * 기존 utils/email.ts(인증번호 메일)와 같은 Gmail SMTP 계정(EMAIL_USER / EMAIL_APP_PASSWORD)을 사용하되,
 * transporter를 한 번만 만들어 재사용하고 일시적 오류는 재시도한다.
 */
let transporter: Transporter | null = null;

const getTransporter = (): Transporter => {
  if (transporter) return transporter;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("SMTP 인증 정보(EMAIL_USER 또는 EMAIL_APP_PASSWORD)가 환경 변수에 설정되지 않았습니다.");
  }

  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user, pass },
  });
  return transporter;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface SendMailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendMail = async ({ to, subject, html, text }: SendMailParams, retries = 3) => {
  const from = `"PromptPlace" <${process.env.EMAIL_USER}>`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await getTransporter().sendMail({ from, to, subject, html, text });
    } catch (error) {
      // 수신 주소 거부(5xx 응답) 같은 영구 오류는 재시도하지 않는다
      const code = (error as { responseCode?: number }).responseCode;
      const permanent = typeof code === "number" && code >= 500;
      if (permanent || attempt === retries) throw error;
      await sleep(1000 * 2 ** (attempt - 1));
    }
  }
};
