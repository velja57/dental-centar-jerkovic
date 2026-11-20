import "server-only";
import { db } from "@/db";
import { emailOutbox } from "@/db/schema";
import { clinic } from "@/content/clinic";

export type OutgoingEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  kind: string;
  appointmentId?: number | null;
};

/**
 * Šalje mejl preko Resend API-ja ako su podešeni RESEND_API_KEY i EMAIL_FROM.
 * Bez njih se mejl samo upisuje u admin → Poruke (ništa ne odlazi napolje) — zgodno za razvoj.
 */
export async function sendEmail(msg: OutgoingEmail) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  let status: "sent" | "logged" | "failed" = "logged";
  let error: string | null = null;

  if (key && from) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: [msg.to], subject: msg.subject, html: msg.html, text: msg.text, reply_to: clinic.email }),
      });
      if (res.ok) status = "sent";
      else {
        status = "failed";
        error = `${res.status} ${await res.text()}`.slice(0, 500);
      }
    } catch (e) {
      status = "failed";
      error = String(e).slice(0, 500);
    }
  }

  try {
    await db.insert(emailOutbox).values({
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
      kind: msg.kind,
      appointmentId: msg.appointmentId ?? null,
      status,
      error,
    });
  } catch (e) {
    console.error("Upis mejla nije uspeo", e);
  }
  return status;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function renderEmail(o: {
  locale: "sr" | "en";
  preheader: string;
  title: string;
  greeting?: string;
  intro: string;
  rows?: [string, string][];
  button?: { label: string; url: string };
  outro?: string;
}) {
  const rows = (o.rows ?? [])
    .map(
      ([k, v]) =>
        `<tr><td style="padding:7px 12px 7px 0;color:#64748b;font-size:14px;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:7px 0;color:#10292a;font-size:15px;font-weight:600">${esc(v)}</td></tr>`,
    )
    .join("");
  const footer = `${clinic.name} · ${clinic.address.street}, ${clinic.address.city} · ${clinic.phoneDisplay}`;
  const html = `<!doctype html><html lang="${o.locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(o.title)}</title></head>
<body style="margin:0;background:#eef6f4;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(o.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef6f4;padding:28px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #dbe9e6">
<tr><td style="background:#187a73;padding:20px 28px;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:.2px">${esc(clinic.name)}</td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 14px;font-size:22px;line-height:1.3;color:#10292a">${esc(o.title)}</h1>
${o.greeting ? `<p style="margin:0 0 8px;font-size:15px;color:#10292a">${esc(o.greeting)}</p>` : ""}
<p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#334155">${esc(o.intro)}</p>
${rows ? `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;margin:0 0 22px;padding:6px 0">${rows}</table>` : ""}
${o.button ? `<p style="margin:0 0 22px"><a href="${esc(o.button.url)}" style="display:inline-block;background:#d63f1a;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:13px 24px;border-radius:999px">${esc(o.button.label)}</a></p>` : ""}
${o.outro ? `<p style="margin:0;font-size:14px;line-height:1.65;color:#64748b">${esc(o.outro)}</p>` : ""}
</td></tr>
<tr><td style="padding:16px 28px;background:#f6faf9;color:#64748b;font-size:12px;line-height:1.6">${esc(footer)}</td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    o.title,
    "",
    ...(o.greeting ? [o.greeting] : []),
    o.intro,
    "",
    ...(o.rows ?? []).map(([k, v]) => `${k}: ${v}`),
    "",
    ...(o.button ? [`${o.button.label}: ${o.button.url}`, ""] : []),
    ...(o.outro ? [o.outro, ""] : []),
    footer,
  ].join("\n");

  return { html, text };
}
