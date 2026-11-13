import {
  calculateAgeFromDOB,
  evaluatePasswordEntropy,
  formatE164Phone,
  validateEmail,
} from './validation';

export interface AgeValidationResult {
  age: number | null;
  isValid: boolean;
  error?: string;
}

export function validateAgeInput(ageText: string): AgeValidationResult {
  const trimmed = ageText.trim();
  if (!trimmed) {
    return { age: null, isValid: false, error: 'Please enter your age.' };
  }
  if (!/^\d{1,3}$/.test(trimmed)) {
    return { age: null, isValid: false, error: 'Please enter a valid age between 0 and 125.' };
  }
  const parsed = parseInt(trimmed, 10);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 125) {
    return { age: null, isValid: false, error: 'Please enter a valid age between 0 and 125.' };
  }
  return { age: parsed, isValid: true };
}

interface Step1ValidationInput {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  ageText: string;
  password: string;
  agreeTerms: boolean;
}

export function validateStep1Submission(input: Step1ValidationInput): {
  error: string | null;
  ageError: string | null;
  age: number | null;
} {
  if (!input.fullName.trim()) {
    return { error: 'Please enter your full name.', ageError: null, age: null };
  }
  const emailRes = validateEmail(input.email);
  if (!emailRes.isValid) {
    return { error: emailRes.error || 'Please enter a valid email address.', ageError: null, age: null };
  }
  const phoneResult = formatE164Phone(input.phone);
  if (input.phone.trim() && !phoneResult.isValid) {
    return {
      error: 'Please enter a valid phone number (e.g. 09171234567 or +639171234567).',
      ageError: null,
      age: null,
    };
  }
  if (!input.dob.trim()) {
    return { error: 'Please select your date of birth.', ageError: null, age: null };
  }
  const dobResult = calculateAgeFromDOB(input.dob);
  if (!dobResult.isValidDate || dobResult.age === null) {
    return { error: dobResult.error || 'Please select a valid date of birth.', ageError: null, age: null };
  }
  const ageCheck = validateAgeInput(input.ageText);
  if (!ageCheck.isValid || ageCheck.age === null) {
    const msg = ageCheck.error || 'Please enter a valid age.';
    return { error: msg, ageError: msg, age: null };
  }
  if (!evaluatePasswordEntropy(input.password).isValid) {
    return { error: 'Password must meet all 4 security requirements below.', ageError: null, age: null };
  }
  if (!input.agreeTerms) {
    return { error: 'Please agree to the Chorpy rules and regulations to continue.', ageError: null, age: null };
  }
  return { error: null, ageError: null, age: ageCheck.age };
}
