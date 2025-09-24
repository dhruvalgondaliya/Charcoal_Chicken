import PDFDocument from "pdfkit";
import OrderSche from "../Models/OrderSch.js";
import UserProSch from "../Models/UserProfiles.js";
import { formatCurrency, formatCurrencyRs } from "../Utiles/Currency.js";

export const getOrderReceipt = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { download } = req.query;

    // Fetch order with cart data populated
    const order = await OrderSche.findById(orderId)
      .populate("items.menuItemId", "name description price")
      .populate("restaurantId", "name address phone email")
      .populate(
        "cartId",
        "subTotal taxAmount totalAmount discountAmount deliveryCharge"
      );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Fetch user profile to get the logo (imageurl)
    const userProfile = await UserProSch.findOne({
      restaurantId: order.restaurantId,
    });
    const imageurl = userProfile?.imageurl || "https://via.placeholder.com/150";

    const date = new Date(order.createdAt);
    // Calculate subtotal from items
    let subTotal = 0;
    order.items.forEach((item) => {
      const price = item?.variant?.price || item?.menuItemId?.price || 0;
      subTotal += price * item.quantity;
    });

    // Apply discount
    const discount = order.discount || order.discountAmount || 0;
    // Show subtotal, discount, and total
    const subTotalFromOrder = order.subTotal || subTotal;
    const totalAmountFromOrder =
      order.totalAmount || subTotalFromOrder - discount;
    const deliveryCharge = order.deliveryCharge || 0;
    const taxAmount = order.taxAmount || 0;

    // Set headers
    res.setHeader(
      "Content-Disposition",
      download === "true"
        ? `attachment; filename=receipt-${order._id}.pdf`
        : "inline; filename=receipt.pdf"
    );
    res.setHeader("Content-Type", "application/pdf");

    // Create PDF document
    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
    });
    doc.pipe(res);

    // Helper function for drawing lines
    const drawLine = (startX, startY, endX, endY, lineWidth = 0.5) => {
      doc
        .strokeColor("#cccccc")
        .lineWidth(lineWidth)
        .moveTo(startX, startY)
        .lineTo(endX, endY)
        .stroke();
    };

    const addSpace = (points = 10) => {
      doc.y += points;
    };

    // Page margins and dimensions
    const pageWidth = doc.page.width;
    const leftMargin = 40;
    const rightMargin = pageWidth - 40;
    const contentWidth = rightMargin - leftMargin;

    // === HEADER SECTION ===
    // Add restaurant logo
    try {
      doc.image(imageurl, leftMargin, 20, {
        width: 100,
        align: "left",
      });
    } catch (imageError) {
      console.error("Error loading logo image:", imageError.message);
      doc
        .fillColor("#2c3e50")
        .fontSize(12)
        .font("Helvetica")
        .text("Restaurant Logo", leftMargin, 20);
    }

    doc.y = 100;
    doc
      .fillColor("#2c3e50")
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("ORDER RECEIPT", leftMargin, doc.y, {
        align: "center",
        width: contentWidth,
      });

    addSpace(20);

    // Draw header line
    drawLine(leftMargin, doc.y, rightMargin, doc.y, 1);
    addSpace(25);

    // === RESTAURANT INFO SECTION ===
    doc.fillColor("#34495e");
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Restaurant Information", leftMargin, doc.y);

    addSpace(1);

    doc.fillColor("#2c3e50");
    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`${order.restaurantId?.name || "N/A"}`, leftMargin, doc.y);

    addSpace(8);

    doc
      .fontSize(10)
      .fillColor("#7f8c8d")
      .text(`${order.restaurantId?.address || "N/A"}`, leftMargin, doc.y);

    if (order.restaurantId?.phone) {
      addSpace(5);
      doc.text(`Phone: ${order.restaurantId.phone}`, leftMargin, doc.y);
    }

    if (order.restaurantId?.email) {
      addSpace(5);
      doc.text(`Email: ${order.restaurantId.email}`, leftMargin, doc.y);
    }

    addSpace(25);

    // === ORDER INFO SECTION ===
    doc.fillColor("#34495e");
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Order Details", leftMargin, doc.y);

    addSpace(15);

    // Order info in two columns
    const leftColX = leftMargin;
    const rightColX = leftMargin + contentWidth / 2;
    const orderInfoY = doc.y;

    // Left column
    doc.fillColor("#2c3e50");
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Order ID:", leftColX, orderInfoY);
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#7f8c8d")
      .text(`${order._id}`, leftColX, orderInfoY + 12);

    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#2c3e50")
      .text("Order Date:", leftColX, orderInfoY + 30);
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#7f8c8d")
      .text(`${date.toLocaleDateString("en-IN")}`, leftColX, orderInfoY + 42);

    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#2c3e50")
      .text("Order Time:", leftColX, orderInfoY + 60);
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#7f8c8d")
      .text(`${date.toLocaleTimeString("en-IN")}`, leftColX, orderInfoY + 72);

    // Right column
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#2c3e50")
      .text("Order Status:", rightColX, orderInfoY);
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor(
        order.orderStatus === "delivered"
          ? "#27ae60"
          : order.orderStatus === "pending"
          ? "#f39c12"
          : "#e74c3c"
      )
      .text(
        `${order.orderStatus?.toUpperCase() || "N/A"}`,
        rightColX,
        orderInfoY + 12
      );

    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#2c3e50")
      .text("Payment Status:", rightColX, orderInfoY + 30);
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor(
        order.paymentStatus === "paid"
          ? "#27ae60"
          : order.paymentStatus === "pending"
          ? "#f39c12"
          : "#e74c3c"
      )
      .text(
        `${order.paymentStatus?.toUpperCase() || "N/A"}`,
        rightColX,
        orderInfoY + 42
      );

    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#2c3e50")
      .text("Payment Method:", rightColX, orderInfoY + 60);
    doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#7f8c8d")
      .text(`${order.paymentMethod || "N/A"}`, rightColX, orderInfoY + 74);

    doc.y = orderInfoY + 90;
    addSpace(20);

    // === ITEMS SECTION ===
    doc.fillColor("#34495e");
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Order Items", leftMargin, doc.y);

    addSpace(15);

    // Define table structure with precise measurements
    const table = {
      x: leftMargin,
      width: contentWidth,
      cols: {
        item: { width: 280 },
        qty: { width: 80 },
        price: { width: 80 },
        total: { width: 80 },
      },
    };

    // Calculate column positions
    let currentX = table.x;
    table.cols.item.x = currentX;
    currentX += table.cols.item.width;
    table.cols.qty.x = currentX;
    currentX += table.cols.qty.width;
    table.cols.price.x = currentX;
    currentX += table.cols.price.width;
    table.cols.total.x = currentX;

    const rowHeight = 35;
    const headerHeight = 30;

    // Draw table header
    const headerY = doc.y;

    // Header background
    doc
      .rect(table.x, headerY, table.width, headerHeight)
      .fillColor("#2c3e50")
      .fill();

    // Header borders
    doc.strokeColor("#ffffff").lineWidth(1);

    // Vertical lines for header
    doc
      .moveTo(table.cols.qty.x, headerY)
      .lineTo(table.cols.qty.x, headerY + headerHeight)
      .stroke();

    doc
      .moveTo(table.cols.price.x, headerY)
      .lineTo(table.cols.price.x, headerY + headerHeight)
      .stroke();

    doc
      .moveTo(table.cols.total.x, headerY)
      .lineTo(table.cols.total.x, headerY + headerHeight)
      .stroke();

    // Header text
    doc.fillColor("#ffffff");
    doc.fontSize(12).font("Helvetica-Bold");

    const headerTextY = headerY + 10;
    doc.text("ITEM", table.cols.item.x + 10, headerTextY);
    doc.text("QTY", table.cols.qty.x, headerTextY, {
      width: table.cols.qty.width,
      align: "center",
    });
    doc.text("PRICE", table.cols.price.x, headerTextY, {
      width: table.cols.price.width,
      align: "center",
    });
    doc.text("TOTAL", table.cols.total.x, headerTextY, {
      width: table.cols.total.width,
      align: "center",
    });

    doc.y = headerY + headerHeight;

    // Table rows
    order.items.forEach((item, index) => {
      // Extract price from your actual nested data structure
      const price = item.variant?.price || item.price || 0; // Use variant.price first
      const qty = item.quantity || 0;
      const lineTotal = qty * price;

      const rowY = doc.y;

      // Row background (alternating colors)
      const rowColor = index % 2 === 0 ? "#ffffff" : "#f8f9fa";
      doc
        .rect(table.x, rowY, table.width, rowHeight)
        .fillColor(rowColor)
        .fill();

      // Row borders
      doc.strokeColor("#e0e0e0").lineWidth(0.5);

      // Vertical lines
      doc
        .moveTo(table.cols.qty.x, rowY)
        .lineTo(table.cols.qty.x, rowY + rowHeight)
        .stroke();

      doc
        .moveTo(table.cols.price.x, rowY)
        .lineTo(table.cols.price.x, rowY + rowHeight)
        .stroke();

      doc
        .moveTo(table.cols.total.x, rowY)
        .lineTo(table.cols.total.x, rowY + rowHeight)
        .stroke();

      // Horizontal line at bottom of row
      doc
        .moveTo(table.x, rowY + rowHeight)
        .lineTo(table.x + table.width, rowY + rowHeight)
        .stroke();

      // Row text
      const textY = rowY + 8;
      doc.fillColor("#2c3e50");
      doc.fontSize(11).font("Helvetica");

      // Item name - use menuItemId name if available
      const itemName =
        item.menuItemId?.name || item.name || `Item ${index + 1}`;
      doc.text(itemName, table.cols.item.x + 10, textY, {
        width: table.cols.item.width - 20,
        ellipsis: true,
      });

      // Add variant info if available (size, etc.)
      let variantInfo = "";
      if (item.variant?.size) {
        variantInfo += `Size: ${item.variant.size}`;
      }

      // Add addOns if they exist
      if (item.addOns && item.addOns.length > 0) {
        const addOnsText = item.addOns
          .map((addon) => addon.name || "Add-on")
          .join(", ");
        if (variantInfo) variantInfo += " | ";
        variantInfo += `Add-ons: ${addOnsText}`;
      }

      // Display variant and add-ons info
      if (variantInfo) {
        doc.fontSize(9).fillColor("#7f8c8d");
        doc.text(variantInfo, table.cols.item.x + 10, textY + 15, {
          width: table.cols.item.width - 20,
          ellipsis: true,
        });
      }

      // Reset color and font for numbers
      doc.fillColor("#2c3e50").fontSize(11);

      // Quantity
      doc.text(qty.toString(), table.cols.qty.x, textY, {
        width: table.cols.qty.width,
        align: "center",
      });

      // Price (variant price)
      doc.text(formatCurrencyRs(price), table.cols.price.x, textY, {
        width: table.cols.price.width,
        align: "center",
      });

      doc.text(formatCurrencyRs(lineTotal), table.cols.total.x, textY, {
        width: table.cols.total.width,
        align: "center",
      });

      doc.y = rowY + rowHeight;
    });

    addSpace(20);

    // === SUMMARY SECTION ===
    const summaryStartX = rightMargin - 220;
    const summaryLabelX = summaryStartX;
    const summaryValueX = rightMargin - 20;

    const addSummaryLine = (label, value, isBold = false, isTotal = false) => {
      const currentY = doc.y;

      if (isTotal) {
        doc
          .rect(summaryStartX - 10, currentY - 5, 230, 25)
          .fillColor("#34495e")
          .fill();
        doc.fillColor("#ffffff");
      } else {
        doc.fillColor("#2c3e50");
      }

      doc
        .fontSize(isBold || isTotal ? 12 : 11)
        .font("Helvetica-Bold")
        .text(label, summaryLabelX, currentY + (isTotal ? 5 : 0))
        .text(value, summaryValueX - 100, currentY + (isTotal ? 5 : 0), {
          align: "right",
          width: 100,
        });

      doc.y += isTotal ? 30 : 22;
    };

    addSummaryLine("Subtotal:", formatCurrencyRs(subTotalFromOrder));

    if (Number(discount) > 0) {
      addSummaryLine("Discount:", `- ${formatCurrencyRs(discount)}`);
    }

    addSummaryLine("Tax:", formatCurrencyRs(taxAmount));

    addSummaryLine(
      "Delivery Charge:",
      Number(deliveryCharge) === 0 ? "FREE" : formatCurrencyRs(deliveryCharge)
    );

    addSpace(5);
    drawLine(summaryStartX, doc.y, rightMargin, doc.y);
    addSpace(10);

    addSummaryLine(
      "TOTAL AMOUNT:",
      formatCurrencyRs(totalAmountFromOrder),
      false,
      true
    );

    addSpace(10);

    // === FOOTER SECTION ===
    drawLine(leftMargin, doc.y, rightMargin, doc.y);
    addSpace(20);

    doc.fillColor("#7f8c8d");
    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Thank you for your order!", leftMargin, doc.y, {
        align: "center",
        width: contentWidth,
      });

    addSpace(2);

    doc
      .fontSize(9)
      .text(
        "For any queries, please contact the restaurant directly.",
        leftMargin,
        doc.y,
        {
          align: "center",
          width: contentWidth,
        }
      );

    addSpace(2);

    doc
      .fontSize(8)
      .text(
        `Receipt generated on ${new Date().toLocaleString("en-IN")}`,
        leftMargin,
        doc.y,
        {
          align: "center",
          width: contentWidth,
        }
      );

    doc.end();
  } catch (error) {
    console.error("Receipt generation error:", error);
    res
      .status(500)
      .json({ message: "Failed to generate receipt", error: error.message });
  }
};
