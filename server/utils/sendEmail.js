const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (toEmail, toName, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: 'Verify your SkillSwap email',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
        <div style="background:linear-gradient(135deg,#5b5ef4,#8b5cf6);padding:36px 40px;text-align:center">
          <div style="font-size:2rem;margin-bottom:8px">⚡</div>
          <h1 style="color:#ffffff;font-size:1.5rem;font-weight:900;margin:0">SkillSwap</h1>
        </div>
        <div style="padding:36px 40px">
          <h2 style="font-size:1.2rem;font-weight:800;color:#0d1117;margin:0 0 12px">Hi ${toName} 👋</h2>
          <p style="color:#4a5568;font-size:0.95rem;line-height:1.7;margin:0 0 28px">
            Thanks for joining SkillSwap! Please verify your email address to activate your account.
          </p>
          <div style="text-align:center;margin-bottom:28px">
            <a href="${verifyUrl}"
               style="display:inline-block;background:linear-gradient(135deg,#5b5ef4,#8b5cf6);color:#ffffff;font-size:0.95rem;font-weight:700;padding:14px 36px;border-radius:10px;text-decoration:none;box-shadow:0 4px 16px rgba(91,94,244,0.35)">
              Verify Email Address
            </a>
          </div>
          <p style="color:#94a3b8;font-size:0.82rem;line-height:1.6;margin:0">
            This link expires in <strong>24 hours</strong>. If you didn't create a SkillSwap account, ignore this email.
          </p>
        </div>
        <div style="padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center">
          <p style="color:#94a3b8;font-size:0.78rem;margin:0">© ${new Date().getFullYear()} SkillSwap. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail };
