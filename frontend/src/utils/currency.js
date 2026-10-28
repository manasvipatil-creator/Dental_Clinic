/**
 * Currency utility for SmileCraft Dental Clinic.
 * Formats price and fee strings with the Indian Rupee symbol (₹).
 * Replaces any existing '$' currency symbols while preserving exact numeric amounts.
 */
export const formatCurrency = (val) => {
  if (val === null || val === undefined || val === '') return '';
  const str = String(val).trim();

  // If already contains Rupee symbol and no Dollar symbol, return as-is
  if (str.includes('₹') && !str.includes('$')) {
    return str;
  }

  // Replace all dollar symbols with Indian Rupee symbol
  if (str.includes('$')) {
    return str.replace(/\$/g, '₹');
  }

  // If it's a numeric string (e.g. "500", "1500 - 3000") without currency symbol
  if (/^\d/.test(str)) {
    return `₹${str}`;
  }

  return str;
};

export default formatCurrency;

