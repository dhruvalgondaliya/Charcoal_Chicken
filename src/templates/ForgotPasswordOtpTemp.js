export const otpEmailTemplate = (otp) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <style>
      body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 40px auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0,0,0,0.1); }
      .header { background: #4CAF50; color: white; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; }
      .content { padding: 20px; text-align: center; }
      .otp { font-size: 32px; font-weight: bold; color: #333; margin: 20px 0; letter-spacing: 5px; }
      .footer { margin-top: 20px; font-size: 12px; color: #888; text-align: center; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>OTP Verification</h2>
      </div>
      <div class="content">
        <p>Hello,</p>
        <p>Use the OTP below to verify your email. It will expire in <b>5 minutes</b>:</p>
        <div class="otp">${otp}</div>
        <p>If you did not request this, please ignore this email.</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Food Management System</p>
      </div>
    </div>
  </body>
  </html>
`;
