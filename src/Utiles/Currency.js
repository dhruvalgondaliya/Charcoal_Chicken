// Currency formatter with INR
export const formatCurrency = (amount = 0) => {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);
};

// Custom Rs. formatter
export const formatCurrencyRs = (amount = 0) => {
  const value = Number(amount) || 0;
  return `Rs. ${value.toFixed(2)}`;
};
