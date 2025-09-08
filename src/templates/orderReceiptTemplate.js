import { formatCurrency } from "../Utiles/Currency.js";

// Generate HTML email template with modern design
export const generateOrderReceiptHTML = (order, customerName) => {
  const {
    orderNumber,
    items,
    totalAmount,
    deliveryAddress,
    orderStatus,
    paymentStatus,
    createdAt,
  } = order;

  const calculatedTotal = totalAmount || calculateOrderTotal(items);
  const formattedDate = formatDate(createdAt);
  const formattedTotal = formatCurrency(calculatedTotal);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Receipt</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6; 
          color: #333;
          background-color: #f5f7fa;
          padding: 20px 0;
        }
        
          // Discount logic
          const discount = order.discount || 0;
          const subTotal = order.subTotal || 0;
          const taxAmount = order.taxAmount || 0;
          const deliveryCharge = order.deliveryCharge || 0;
          const totalAmountFinal = order.totalAmount || (subTotal - discount + taxAmount + deliveryCharge);
          const formattedDate = formatDate(createdAt);
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
          padding: 40px 20px;
        }
        
        .header h1 {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .header .subtitle {
          font-size: 16px;
          opacity: 0.9;
        }
        
        .content {
          padding: 40px 30px;
        }
        
        .greeting {
          font-size: 18px;
          margin-bottom: 25px;
          color: #2d3748;
        }
        
        .order-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 35px;
          background-color: #f8fafc;
          padding: 25px;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }
        
        .info-item {
          display: flex;
          flex-direction: column;
        }
        
        .info-label {
          font-size: 12px;
          font-weight: 600;
          color: #718096;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        
        .info-value {
        width:180px;
          font-size: 14px;
          font-weight: 500;
          color: #2d3748;
        }
        
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }
        
        .status-pending { background-color: #fed7d7; color: #c53030; }
        .status-confirmed { background-color: #c6f6d5; color: #2f855a; }
        .status-delivered { background-color: #bee3f8; color: #2b6cb0; }
        .status-paid { background-color: #c6f6d5; color: #2f855a; }
        .status-unpaid { background-color: #fed7d7; color: #c53030; }
        
        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 20px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .items-table th {
          background: linear-gradient(135deg, #4a5568, #2d3748);
          color: white;
          padding: 16px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .items-table td {
          padding: 16px 12px;
          border-bottom: 1px solid #e2e8f0;
          background-color: white;
        }
        
        .items-table tr:nth-child(even) td {
          background-color: #f7fafc;
        }
        
        .items-table tr:hover td {
          background-color: #edf2f7;
          transition: background-color 0.2s ease;
        }
        
        .item-name {
          font-weight: 500;
          color: #2d3748;
        }
        
        .quantity-badge {
          background-color: #667eea;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .total-section {
          background: linear-gradient(135deg, #f7fafc, #edf2f7);
          padding: 25px;
          border-radius: 8px;
          margin-bottom: 35px;
          text-align: right;
        }
        
        .total-amount {
          font-size: 24px;
          font-weight: 700;
          color: #2d3748;
          margin-top: 10px;
        }
        
        .address-section {
          background-color: #f8fafc;
          padding: 25px;
          border-radius: 8px;
          border-left: 4px solid #48bb78;
          margin-bottom: 35px;
        }
        
        .address-content {
          line-height: 1.8;
        }
        
        .address-name {
          font-weight: 600;
          font-size: 16px;
          color: #2d3748;
          margin-bottom: 8px;
        }
        
        .address-details {
          color: #4a5568;
          font-size: 14px;
        }
        
        .footer {
          background: linear-gradient(135deg, #2d3748, #4a5568);
          color: white;
          text-align: center;
          padding: 30px 20px;
        }
        
        .footer-message {
          font-size: 18px;
          font-weight: 500;
          margin-bottom: 15px;
        }
        
        .footer-signature {
          font-size: 14px;
          opacity: 0.9;
          line-height: 1.6;
        }
        
        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #e2e8f0, transparent);
          margin: 30px 0;
        }
        
        /* Mobile responsiveness */
        @media only screen and (max-width: 600px) {
          .email-container {
            margin: 0 10px;
            border-radius: 8px;
          }
          
          .content {
            padding: 25px 20px;
          }

          .info-value{
            font-size:11px;
          }
          
          .order-info-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          
          .items-table th,
          .items-table td {
            padding: 12px 8px;
            font-size: 12px;
          }
          
          .header h1 {
            font-size: 24px;
          }
          
          .total-amount {
            font-size: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>Order Confirmation</h1>
          <div class="subtitle">Thank you for your order!</div>
        </div>
        
        <div class="content">
          <div class="greeting">
            Hello ${
              customerName || deliveryAddress?.FullName || "Valued Customer"
            },
          </div>
          
          <p style="margin-bottom: 30px; color: #4a5568; font-size: 16px;">
            We're excited to confirm your order! Here are all the details:
          </p>
          
          <div class="order-info-grid">
            <div class="info-item">
              <span class="info-label">Order Number</span>
              <span class="info-value">#${
                orderNumber || order._id || "N/A"
              }</span>
            </div>
            <div class="info-item">
              <span class="info-label">Order Date</span>
              <span class="info-value">${formattedDate}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Order Status</span>
              <span class="info-value">
                <span class="status-badge status-${(
                  orderStatus || "pending"
                ).toLowerCase()}">${orderStatus || "Pending"}</span>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Payment Status</span>
              <span class="info-value">
                <span class="status-badge status-${(
                  paymentStatus || "unpaid"
                ).toLowerCase()}">${paymentStatus || "Unpaid"}</span>
              </span>
            </div>
          </div>
          
          <h2 class="section-title">Order Summary</h2>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
          <tbody>
          ${items
            .map((item) => {
              const itemName =
                item.FullName ||
                (item.menuItemId && item.menuItemId.name) ||
                "Unknown Item";

              const basePrice = item.price || 0;
              const variantPrice =
                item.variant && item.variant.price ? item.variant.price : null;
              const itemPrice =
                variantPrice !== null ? variantPrice : basePrice;

              const itemQuantity = item.quantity || 1;
              const itemTotal = itemPrice * itemQuantity;

              return `
                <tr>
                  <td class="item-name">${itemName}</td>
                  <td><span class="quantity-badge">${itemQuantity}</span></td>
                  <td>${formatCurrency(itemPrice)}</td>
                  <td style="font-weight: 600;">${formatCurrency(
                    itemTotal
                  )}</td>
                </tr>
              `;
            })
            .join("")}
        </tbody>

        <tfoot>
            <tr>
              <td colspan="3" style="text-align:right;font-weight:600;">Sub Total:</td>
              <td style="font-weight:600;">${formatCurrency(order.subTotal || 0)}</td>
            </tr>
            ${
              order.taxAmount && order.taxAmount > 0
                ? `<tr>
                    <td colspan="3" style="text-align:right;font-weight:600;">Tax:</td>
                    <td style="font-weight:600;">${formatCurrency(order.taxAmount)}</td>
                  </tr>`
                : ""
            }
            ${
              order.discount && order.discount > 0
                ? `<tr>
                    <td colspan="3" style="text-align:right;font-weight:600;">Discount:</td>
                    <td style="font-weight:600;">-${formatCurrency(order.discount)}</td>
                  </tr>`
                : ""
            }
            <tr>
              <td colspan="3" style="text-align:right;font-weight:700;">Total:</td>
              <td style="font-weight:700;">${formatCurrency(order.totalAmount || 0)}</td>
            </tr>
          </tfoot>
          </table>
          
          
          <h2 class="section-title">Delivery Information</h2>
          <div class="address-section">
            <div class="address-content">
              <div class="address-name">${
                deliveryAddress?.FullName || "N/A"
              }</div>
              <div class="address-details">
                📞 ${deliveryAddress?.PhoneNumber || "N/A"}<br>
                📍 ${deliveryAddress?.Address || "N/A"}<br>
                ${deliveryAddress?.City || "N/A"}, ${
                deliveryAddress?.ZIPCode || "N/A"
              }
              </div>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <p style="text-align: center; color: #4a5568; font-style: italic;">
            We'll send you updates about your order status via email and SMS.
          </p>
        </div>
        
        <div class="footer">
          <div class="footer-message">Thank you for choosing us! 🍽️</div>
          <div class="footer-signature">
            Best regards,<br>
            <strong>Your Restaurant Team</strong><br>
            <small>Need help? Reply to this email or contact our support team.</small>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate text email template (for fallback)
export const generateOrderReceiptText = (order, customerName) => {
  const {
    orderNumber,
    items,
    totalAmount,
    deliveryAddress,
    orderStatus,
    paymentStatus,
    createdAt,
  } = order;

  const calculatedTotal = totalAmount || calculateOrderTotal(items);
  const formattedDate = formatDate(createdAt);
  const formattedTotal = formatCurrency(calculatedTotal);

  // Format items for text email
  const itemsText = items
    .map((item, index) => {
      const itemName =
        item.FullName ||
        (item.menuItemId && item.menuItemId.name) ||
        "Unknown Item";
      const itemPrice = item.price || 0;
      const itemQuantity = item.quantity || 1;
      const itemTotal = itemPrice * itemQuantity;

      return `${index + 1}. ${itemName}
   Quantity: ${itemQuantity}
   Price: ${formatCurrency(itemPrice)}
   Subtotal: ${formatCurrency(itemTotal)}`;
    })
    .join("\n\n");

  return `
═══════════════════════════════════════
          ORDER CONFIRMATION
═══════════════════════════════════════

Hello ${customerName || deliveryAddress?.FullName || "Valued Customer"},

Thank you for your order! Here are the details:

ORDER INFORMATION:
─────────────────────────────────────
Order Number: #${orderNumber || order._id || "N/A"}
Order Date: ${formattedDate}
Order Status: ${orderStatus || "Pending"}
Payment Status: ${paymentStatus || "Unpaid"}

ORDER SUMMARY:
─────────────────────────────────────
${itemsText || "No items found"}

─────────────────────────────────────
TOTAL AMOUNT: ${formattedTotal}
─────────────────────────────────────

DELIVERY ADDRESS:
─────────────────────────────────────
${deliveryAddress?.FullName || "N/A"}
Phone: ${deliveryAddress?.PhoneNumber || "N/A"}
Address: ${deliveryAddress?.Address || "N/A"}
City: ${deliveryAddress?.City || "N/A"} ${deliveryAddress?.ZIPCode || "N/A"}

═══════════════════════════════════════

We'll keep you updated on your order status via email and SMS.

Thank you for choosing us!

Best regards,
Your Restaurant Team

Need help? Reply to this email or contact our support team.
  `;
};

// Helper function to calculate order total if not provided
const calculateOrderTotal = (items) => {
  try {
    return items.reduce((total, item) => {
      const itemPrice = item.price || 0;
      const itemQuantity = item.quantity || 1;
      return total + itemPrice * itemQuantity;
    }, 0);
  } catch (error) {
    console.error("Error calculating order total:", error);
    return 0;
  }
};

// Enhanced date formatting function
const formatDate = (date) => {
  if (!date) return "N/A";

  try {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "N/A";
  }
}
