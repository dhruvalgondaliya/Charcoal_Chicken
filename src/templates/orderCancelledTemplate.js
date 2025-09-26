// This file should only generate the HTML string
export const generateOrderCancelledHTML = (
  order,
  name,
  imageurl,
  restaurantName
) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Cancelled - ${restaurantName}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      
      <!-- Main Container -->
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        
        <!-- Header Section -->
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #e74c3c 100%); padding: 30px 20px; text-align: center; border-radius: 0 0 0 0;">
          <div style="background-color: rgba(255,255,255,0.1); padding: 15px; border-radius: 12px; display: inline-block; margin-bottom: 20px;">
            <img src="${imageurl}" alt="${restaurantName}" style="max-width: 120px; height: auto; border-radius: 8px; filter: brightness(1.1);" />
          </div>
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
            Order Cancelled
          </h1>
        </div>

        <!-- Content Section -->
        <div style="padding: 40px 30px;">
          
          <!-- Greeting -->
          <div style="margin-bottom: 30px;">
          <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 24px; font-weight: 500;">
            Hi ${name},
          </h2>
          <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0;">
            Your order from <strong style="color: #2c3e50;">${restaurantName}</strong> has been 
            <strong style="color: #e74c3c;">successfully cancelled</strong>.
          </p>
        </div>
          
          <!-- Order Info Card -->
          <div style="background: linear-gradient(135deg, #fff5f5 0%, #fef2f2 100%); border: 2px solid #fecaca; border-radius: 12px; padding: 15px; margin-bottom: 30px; position: relative;">
            <div style="position: absolute; top: -10px; left: 20px; background: #ef4444; color: white; padding: 5px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
              Cancelled
            </div>
            <div style="margin-top: 10px;">
              <p style="color: #374151; font-size: 13px; margin: 0 0 10px 0;">
                <strong>Order ID: </strong> <span style="color: #ef4444; font-family: 'Courier New', monospace; background: #fef2f2; padding: 4px 8px; border-radius: 4px; font-size: 12px;">#${
                  order._id
                }</span>
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.5;">
                If you've already made a payme1nt, the refund will be processed within <strong style="color: #059669;">5–7 business days</strong> to your original payment method.
              </p>
            </div>
          </div>

          <!-- Order Summary -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; border-bottom: 3px solid #e5e7eb; padding-bottom: 10px;">
              Order Summary
            </h3>
            
            <div style="background: #f9fafb; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
              ${order.items
                .map(
                  (item, index) => `
                <div style="padding: 18px 20px; ${
                  index !== order.items.length - 1
                    ? "border-bottom: 1px solid #e5e7eb;"
                    : ""
                } display: flex; justify-content: space-between; align-items: center;">
                  <div style="flex: 1;">
                    <div style="color: #374151; font-size: 16px; font-weight: 500; margin-bottom: 4px;">
                      ${item.menuItemId?.name}
                    </div>
                    <div style="color: #6b7280; font-size: 14px;">
                      Quantity: <span style="color: #059669; font-weight: 600;">${
                        item.quantity
                      }</span>
                    </div>
                  </div>
                  <div style="color: #1f2937; font-size: 16px; font-weight: 600;">
                    ₹${item.menuItemId?.price * item.quantity}
                  </div>
                </div>`
                )
                .join("")}
              
              <!-- Total Section -->
              <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); padding: 15px; color: white;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 18px; font-weight: 600;">Total Amount:</span>
                  <span style="font-size: 24px; font-weight: 700;">₹${
                    order.totalAmount
                  }</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Support Notice -->
          <div style="background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%); border: 1px solid #bfdbfe; border-radius: 12px; padding: 15px; margin-bottom: 30px;">
            <div style="display: flex; align-items: flex-start;">
              <div>
                <h4 style="color: #1e40af; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
                  Need Help?
                </h4>
                <p style="color: #1e40af; margin: 0; font-size: 14px; line-height: 1.5;">
                  If you didn't request this cancellation or have any questions about your refund, please don't hesitate to contact our support team. We're here to help!
                </p>
              </div>
            </div>
          </div>

          <!-- Footer Message -->
          <div style="text-align: center; padding: 20px 0; border-top: 2px solid #f3f4f6;">
            <p style="color: #6b7280; font-size: 16px; margin: 0 0 10px 0; line-height: 1.6;">
              We apologize for any inconvenience caused and appreciate your understanding.
            </p>
            <p style="color: #374151; font-size: 18px; font-weight: 600; margin: 0;">
              Thank you for choosing <span style="color: #3b82f6;">${restaurantName}</span>
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 15px 0 0 0;">
              We hope to serve you again soon! 🍽️
            </p>
          </div>
        </div>

        <!-- Email Footer -->
        <div style="background: #f8f9fa; padding: 15px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; margin: 0; line-height: 1.4;">
            This is an automated message. Please do not reply to this email.<br>
            © ${new Date().getFullYear()} ${restaurantName}. All rights reserved.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
};
