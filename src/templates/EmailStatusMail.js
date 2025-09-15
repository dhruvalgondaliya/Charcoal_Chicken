export const approvalEmailTemplate = (restaurantName, ownerName) => `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f7fb;
        color: #333;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #43a047, #66bb6a);
        color: #fff;
        text-align: center;
        padding: 25px 15px;
      }
      .header h2 {
        margin: 0;
        font-size: 22px;
        font-weight: 600;
      }
      .content {
        padding: 25px 30px;
        line-height: 1.7;
      }
      .content p {
        margin: 12px 0;
        font-size: 15px;
        color: #444;
      }
      .content strong {
        color: #43a047;
      }
      .button {
        display: inline-block;
        margin: 20px 0;
        padding: 12px 24px;
        background: #43a047;
        color: #fff !important;
        text-decoration: none;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 500;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      }
      .footer {
        background: #f1f3f6;
        text-align: center;
        font-size: 12px;
        color: #777;
        padding: 15px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>🎉 Congratulations! Your Restaurant is Approved</h2>
      </div>
      <div class="content">
        <p>Dear ${ownerName},</p>
        <p>We are excited to let you know that your restaurant, <strong>${restaurantName}</strong>, has been successfully approved on our platform! 🚀</p>
        <p>You can now manage your restaurant profile, menu, and orders seamlessly.</p>
        <p>If you need any help, our support team is always here for you.</p>
        <p>Best regards,<br><strong>The Platform Team</strong></p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Charcole Chicken. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
`;

export const rejectionEmailTemplate = (restaurantName, ownerName) => `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f7fb;
        color: #333;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #e53935, #ef5350);
        color: #fff;
        text-align: center;
        padding: 25px 15px;
      }
      .header h2 {
        margin: 0;
        font-size: 22px;
        font-weight: 600;
      }
      .content {
        padding: 25px 30px;
        line-height: 1.7;
      }
      .content p {
        margin: 12px 0;
        font-size: 15px;
        color: #444;
      }
      .content strong {
        color: #e53935;
      }
      .button {
        display: inline-block;
        margin: 20px 0;
        padding: 12px 24px;
        background: #e53935;
        color: #fff !important;
        text-decoration: none;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 500;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      }
      .footer {
        background: #f1f3f6;
        text-align: center;
        font-size: 12px;
        color: #777;
        padding: 15px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>⚠️ Restaurant Application Update</h2>
      </div>
      <div class="content">
        <p>Dear ${ownerName},</p>
        <p>We regret to inform you that your restaurant, <strong>${restaurantName}</strong>, has not been approved at this time.</p>
        <p>After careful review, we found that your application did not meet our current criteria.</p>
        <p>If you’d like more details or wish to appeal this decision, please contact our support team.</p>
        <p>
          <a href="https://yourplatform.com/support" class="button">Contact Support</a>
        </p>
        <p>We truly appreciate your interest in joining our platform and encourage you to reapply in the future.</p>
        <p>Best regards,<br><strong>The Platform Team</strong></p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Charcole Chicken. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
`;
