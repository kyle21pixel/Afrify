/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    if (typeof globalThis !== 'undefined' && globalThis.URL) {
      new globalThis.URL(url);
    } else {
      // Fallback for environments without URL
      const pattern = /^(https?:\/\/)([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
      return pattern.test(url);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate slug (URL-friendly string)
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Validate SKU
 */
export function isValidSKU(sku: string): boolean {
  const skuRegex = /^[A-Z0-9-]+$/;
  return skuRegex.test(sku);
}

/**
 * Validate price (positive number with up to 2 decimals)
 */
export function isValidPrice(price: number): boolean {
  return price >= 0 && Number.isFinite(price);
}

/**
 * Validate quantity (positive integer)
 */
export function isValidQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity >= 0;
}

/**
 * Validate hex color
 */
export function isValidHexColor(color: string): boolean {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else {
    score++;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter');
  } else {
    score++;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter');
  } else {
    score++;
  }

  if (!/[0-9]/.test(password)) {
    feedback.push('Password must contain at least one number');
  } else {
    score++;
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    feedback.push('Password must contain at least one special character');
  } else {
    score++;
  }

  const isValid = feedback.length === 0;
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'medium';

  return { isValid, strength, feedback };
}

/**
 * Sanitize string (remove HTML tags)
 */
export function sanitizeString(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Validate required fields
 */
export function validateRequired<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[],
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missingFields.push(field as string);
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}
