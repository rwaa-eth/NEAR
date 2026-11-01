import type { Config } from "./config";

export async function sendMail(
  config: Config,
  message: { to: string; subject: string; text: string },
): Promise<void> {
  if (config.resendApiKey) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${config.resendApiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: config.emailFrom,
        to: [message.to],
        subject: message.subject,
        text: message.text,
      }),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(body || `Resend returned ${response.status}`);
    }
    return;
  }

  if (config.smtpUrl) {
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.createTransport(config.smtpUrl);
    await transport.sendMail({
      from: config.emailFrom,
      to: message.to,
      subject: message.subject,
      text: message.text,
    });
    return;
  }

  if (config.emailDevMode) {
    console.log(`[email-dev] to=${message.to} subject=${message.subject}\n${message.text}`);
    return;
  }

  throw new Error("Set RESEND_API_KEY or SMTP_URL to send mail from this server");
}

export function mailConfigured(config: Config): boolean {
  return Boolean(config.resendApiKey || config.smtpUrl || config.emailDevMode);
}
