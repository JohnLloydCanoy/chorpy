import { calculateAgeFromDOB, formatE164Phone, formatTitleCase } from './validation';
import { validateAgeInput } from './onboardingValidation';
import { UpdateProfileParams } from '../services/authService';

export interface ProfileFormValues {
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  ageText: string;
}

export interface ProfileFieldErrors {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  ageText?: string;
}

export interface ProfileValidationResult {
  isValid: boolean;
  fieldErrors: ProfileFieldErrors;
  formError: string | null;
  payload: UpdateProfileParams | null;
}

export function sanitizeProfileText(raw: string): string {
  return raw.replace(/\0/g, '').replace(/<[^>]*>/g, '').trim();
}

export function getProfileInitials(
  fullName: string | null | undefined,
  email: string | null | undefined
): string {
  const cleanedName = sanitizeProfileText(fullName ?? '');
  if (cleanedName) {
    const parts = cleanedName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return parts[0].charAt(0).toUpperCase();
  }
  const cleanedEmail = (email ?? '').trim();
  return cleanedEmail ? cleanedEmail.charAt(0).toUpperCase() : 'C';
}

export function formatProfilePhoneDisplay(phone: string | null | undefined): string {
  const trimmed = (phone ?? '').trim();
  if (!trimmed) return 'Not set';
  const result = formatE164Phone(trimmed);
  return result.isValid ? result.formatted : trimmed;
}

export function formatProfileAgeDisplay(
  age: number | null | undefined,
  dob: string | null | undefined
): string {
  if (typeof age === 'number' && !Number.isNaN(age)) {
    return `${age} years old`;
  }
  const trimmedDob = (dob ?? '').trim();
  return trimmedDob || 'Not set';
}

export function validateProfileUpdate(values: ProfileFormValues): ProfileValidationResult {
  const fieldErrors: ProfileFieldErrors = {};

  const sanitizedName = formatTitleCase(sanitizeProfileText(values.fullName));
  if (sanitizedName.length < 2) {
    fieldErrors.fullName = 'Full name must be at least 2 characters.';
  } else if (sanitizedName.length > 80) {
    fieldErrors.fullName = 'Full name must be 80 characters or fewer.';
  }

  const trimmedPhone = sanitizeProfileText(values.phoneNumber);
  let normalizedPhone: string | null = null;
  if (trimmedPhone) {
    const phoneRes = formatE164Phone(trimmedPhone);
    if (!phoneRes.isValid) {
      fieldErrors.phoneNumber = 'Enter a valid phone number (e.g. 09171234567 or +639171234567).';
    } else {
      normalizedPhone = phoneRes.e164;
    }
  }

  const trimmedDob = values.dateOfBirth.trim();
  let normalizedDob: string | null = null;
  if (trimmedDob) {
    const dobRes = calculateAgeFromDOB(trimmedDob);
    if (!dobRes.isValidDate) {
      fieldErrors.dateOfBirth = dobRes.error || 'Please select a valid date of birth.';
    } else {
      normalizedDob = trimmedDob;
    }
  }

  const trimmedAge = values.ageText.trim();
  let normalizedAge: number | null = null;
  if (trimmedAge) {
    const ageRes = validateAgeInput(trimmedAge);
    if (!ageRes.isValid || ageRes.age === null) {
      fieldErrors.ageText = ageRes.error || 'Please enter a valid age between 0 and 125.';
    } else {
      normalizedAge = ageRes.age;
    }
  }

  const firstError =
    fieldErrors.fullName ||
    fieldErrors.phoneNumber ||
    fieldErrors.dateOfBirth ||
    fieldErrors.ageText ||
    null;

  if (firstError) {
    return { isValid: false, fieldErrors, formError: firstError, payload: null };
  }

  return {
    isValid: true,
    fieldErrors: {},
    formError: null,
    payload: {
      full_name: sanitizedName,
      phone_number: normalizedPhone,
      date_of_birth: normalizedDob,
      age: normalizedAge,
    },
  };
}
