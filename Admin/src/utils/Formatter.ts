/**
 * Format the identity display value.
 * If text is a phone number, prepends +91 and formats as +91 XXXXX XXXXX.
 * If text is an email or contains letters, returns it as is.
 */

export const formatIdentityDisplay = (text?: string | null): string => {
  if (!text) return '';
  // If it's an email or contains letters, do not apply phone formatting
  if (text.includes('@') || /[a-zA-Z]/.test(text)) return text;

  // Extract digits and remove potential country code if it was already cleaned but somehow persisted
  let raw = text.replace(/\D/g, '');
  
  // If we have more than 10 digits and it starts with 91, isolate the 10 digit number
  if (raw.startsWith('91') && raw.length > 10) {
    raw = raw.substring(2);
  }

  // Limit to 10 digits for the number part
  const cleanNumber = raw.substring(0, 10);
  if (cleanNumber.length === 0) return '';

  // Apply formatting +91 XXXXX XXXXX
  let formatted = '+91 ';
  formatted += cleanNumber.substring(0, 5);
  if (cleanNumber.length > 5) {
    formatted += ' ' + cleanNumber.substring(5, 10);
  }
  
  return formatted;
};

/**
 * Cleans the identity input.
 * For phone numbers, returns only the 10 raw digits (stripping any +91 prefix).
 * For emails or strings with letters, returns the text as is.
 */
export const cleanIdentityInput = (text?: string | null): string => {
  if (!text) return '';
  // Keep as is if it's an email or contains letters
  if (text.includes('@') || /[a-zA-Z]/.test(text)) return text;

  const digits = text.replace(/\D/g, '');

  // If the input starts with '+' (likely from our formatter) or is long and starts with 91
  // we treat the first '91' as the country code and strip it.
  if (digits.startsWith('91')) {
    // If it's exactly the prefix (+91) or has more than 10 digits total
    if (text.trim().startsWith('+') || digits.length > 10) {
      return digits.substring(2, 12);
    }
  }

  return digits.substring(0, 10);
};

/**
 * Format number as Indian Currency (Rupees)
 */
export const formatCurrency = (amount: number | string): string => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(value)) return '₹0.00';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(value);
};

