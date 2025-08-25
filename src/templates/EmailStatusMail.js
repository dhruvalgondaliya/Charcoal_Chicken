export const approvalEmailTemplate = (restaurantName, ownerName) => `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background-color: #4CAF50; color: white; padding: 10px; text-align: center; }
      .content { padding: 20px; background-color: #f9f9f9; }
      .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>Congratulations! Your Restaurant is Approved</h2>
      </div>
      <div class="content">
        <p>Dear ${ownerName},</p>
        <p>We are thrilled to inform you that your restaurant, <strong>${restaurantName}</strong>, has been successfully approved on our platform!</p>
        <p>You can now start managing your restaurant's profile, menu, and orders through our platform. Log in to your account to get started.</p>
        <p>If you have any questions or need assistance, feel free to contact our support team.</p>
        <p>Best regards,<br>The Platform Team</p>
      </div>
      <div class="footer">
        <p>&copy; 2025 Your Platform Name. All rights reserved.</p>
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
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background-color: #f44336; color: white; padding: 10px; text-align: center; }
      .content { padding: 20px; background-color: #f9f9f9; }
      .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>Restaurant Application Update</h2>
      </div>
      <div class="content">
        <p>Dear ${ownerName},</p>
        <p>We regret to inform you that your restaurant, <strong>${restaurantName}</strong>, has not been approved at this time.</p>
        <p>After careful review, we found that your application did not meet our current criteria. For more details or to appeal this decision, please contact our support team.</p>
        <p>We appreciate your interest in joining our platform and encourage you to reapply in the future.</p>
        <p>Best regards,<br>The Platform Team</p>
      </div>
      <div class="footer">
        <p>&copy; 2025 Your Platform Name. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
`;
