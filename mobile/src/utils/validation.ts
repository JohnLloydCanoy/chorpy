/**
 * Validation and Formatting Utilities for Chorpy Authentication
 */

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PasswordCriteria {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
}

export interface PasswordEntropyResult {
  isValid: boolean;
  criteria: PasswordCriteria;
}

export interface PhoneFormatResult {
  e164: string;
  formatted: string;
  isValid: boolean;
}

export interface DobCalculationResult {
  age: number | null;
  isValidDate: boolean;
  isUnder18: boolean;
  error?: string;
}

// RFC 5322 Compliant Email Regex
const RFC5322_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

/**
 * Validates email according to RFC 5322 standard
 */
export function validateEmail(email: string): EmailValidationResult {
  const trimmed = email ? email.trim() : '';
  if (!trimmed) {
    return { isValid: false, error: 'Email address is required.' };
  }
  if (!RFC5322_EMAIL_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address (e.g., user@domain.com).',
    };
  }
  return { isValid: true };
}

/**
 * Evaluates password entropy across 4 required criteria:
 * 1. minLength >= 8
 * 2. at least 1 uppercase letter
 * 3. at least 1 lowercase letter
 * 4. at least 1 numeric digit
 */
export function evaluatePasswordEntropy(password: string): PasswordEntropyResult {
  const pwd = password || '';
  const minLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);

  const isValid = minLength && hasUpper && hasLower && hasNumber;

  return {
    isValid,
    criteria: {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
    },
  };
}

/**
 * Auto-trims and title-cases every word (e.g., "john doe" -> "John Doe")
 */
export function formatTitleCase(text: string): string {
  if (!text) return '';
  const trimmed = text.trim();
  if (!trimmed) return '';
  return trimmed
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Standardizes phone numbers to E.164 international standard
 * Supports international prefix (+), local Philippine format (09xx / 9xx), and North American format.
 */
export function formatE164Phone(input: string): PhoneFormatResult {
  const raw = input ? input.trim() : '';
  if (!raw) {
    return { e164: '', formatted: '', isValid: false };
  }

  const hasPlus = raw.startsWith('+');
  const digits = raw.replace(/\D/g, '');

  if (!digits) {
    return { e164: '', formatted: '', isValid: false };
  }

  let e164 = '';
  if (hasPlus) {
    e164 = `+${digits}`;
  } else if (digits.startsWith('09') && digits.length === 11) {
    // Local Philippine format: 09171234567 -> +639171234567
    e164 = `+63${digits.slice(1)}`;
  } else if (digits.length === 10 && digits.startsWith('9')) {
    // Philippine without leading 0: 9171234567 -> +639171234567
    e164 = `+63${digits}`;
  } else if (digits.length === 10) {
    // 10-digit North American format: 4155552671 -> +14155552671
    e164 = `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    // 11-digit North American with 1: 14155552671 -> +14155552671
    e164 = `+${digits}`;
  } else {
    // Default prepend +
    e164 = `+${digits}`;
  }

  // E.164 specification: '+' followed by 7 to 15 digits
  const isValid = /^\+[1-9]\d{7,14}$/.test(e164);

  // Friendly formatted presentation
  let formatted = e164;
  if (e164.startsWith('+63') && e164.length === 13) {
    formatted = `+63 ${e164.slice(3, 6)} ${e164.slice(6, 9)} ${e164.slice(9)}`;
  } else if (e164.startsWith('+1') && e164.length === 12) {
    formatted = `+1 (${e164.slice(2, 5)}) ${e164.slice(5, 8)}-${e164.slice(8)}`;
  }

  return { e164, formatted, isValid };
}

/**
 * Parses YYYY-MM-DD, validates calendar date, and calculates age in years.
 * Flags isUnder18 if calculated age < 18.
 */
export function calculateAgeFromDOB(dobString: string): DobCalculationResult {
  const trimmed = dobString ? dobString.trim() : '';
  if (!trimmed) {
    return { age: null, isValidDate: false, isUnder18: false, error: 'Date of birth is required.' };
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) {
    return {
      age: null,
      isValidDate: false,
      isUnder18: false,
      error: 'Please enter date in YYYY-MM-DD format.',
    };
  }

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (year < 1900) {
    return { age: null, isValidDate: false, isUnder18: false, error: 'Year must be 1900 or later.' };
  }

  if (month < 1 || month > 12) {
    return { age: null, isValidDate: false, isUnder18: false, error: 'Month must be between 01 and 12.' };
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return {
      age: null,
      isValidDate: false,
      isUnder18: false,
      error: `Day must be between 01 and ${daysInMonth} for this month.`,
    };
  }

  const birthDate = new Date(year, month - 1, day);
  const today = new Date();

  // Normalize today to start of day for accurate comparison
  today.setHours(0, 0, 0, 0);

  if (birthDate > today) {
    return { age: null, isValidDate: false, isUnder18: false, error: 'Date of birth cannot be in the future.' };
  }

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 0) {
    return { age: null, isValidDate: false, isUnder18: false, error: 'Invalid date of birth.' };
  }

  return {
    age,
    isValidDate: true,
    isUnder18: age < 18,
  };
}
