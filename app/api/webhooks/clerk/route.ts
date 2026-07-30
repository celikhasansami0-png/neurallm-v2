import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Verify Svix signature
  const svixId = request.headers.get('svix-id');
  const svixTimestamp = request.headers.get('svix-timestamp');
  const svixSignature = request.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const body = await request.text();
  const wh = new Webhook(webhookSecret);

  let event: { type: string; data: { email_addresses?: { email_address: string }[]; first_name?: string; last_name?: string } };
  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as typeof event;
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'user.created') {
    const email = event.data.email_addresses?.[0]?.email_address;
    const firstName = event.data.first_name || 'there';

    if (email) {
      await resend.emails.send({
        from: 'NeuraLLM <onboarding@resend.dev>',
        to: email,
        subject: 'Welcome to NeuraLLM 🧠',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:#000000;padding:32px 40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;letter-spacing:-0.5px;">NeuraLLM</h1>
              <p style="color:rgba(255,255,255,0.6);margin:8px 0 0;font-size:14px;">AI OS for Consulting Firms</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="color:#0a0a0a;margin:0 0 16px;font-size:22px;font-weight:600;">Welcome, ${firstName}! 👋</h2>
              <p style="color:#555;margin:0 0 24px;font-size:16px;line-height:1.6;">
                Your NeuraLLM account is ready. You now have access to an AI-powered knowledge base built for consulting teams.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="font-size:20px;">📄</span>
                    <span style="color:#0a0a0a;font-size:15px;font-weight:500;margin-left:12px;">Upload documents & PDFs</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;">
                    <span style="font-size:20px;">🔗</span>
                    <span style="color:#0a0a0a;font-size:15px;font-weight:500;margin-left:12px;">Connect 18+ integrations</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;">
                    <span style="font-size:20px;">🤖</span>
                    <span style="color:#0a0a0a;font-size:15px;font-weight:500;margin-left:12px;">Ask your AI Copilot anything</span>
                  </td>
                </tr>
              </table>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#000000;border-radius:8px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://neurallm-v2.vercel.app'}" style="display:inline-block;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;">Open NeuraLLM →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #f0f0f0;text-align:center;">
              <p style="color:#999;margin:0;font-size:13px;">© 2026 NeuraLLM · You're receiving this because you signed up.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `.trim(),
      });
    }
  }

  return NextResponse.json({ ok: true });
}
