export type AuthMethod = 'email' | 'phone';

export interface PasswordRequirement {
  id: string;
  label: string;
  test: (pwd: string) => boolean;
}

export const passwordRequirements: PasswordRequirement[] = [
  {
    id: 'length',
    label: 'At least 12 characters',
    test: (pwd: string) => pwd.length >= 12,
  },
  {
    id: 'case',
    label: 'Uppercase and lowercase',
    test: (pwd: string) => /[a-z]/.test(pwd) && /[A-Z]/.test(pwd),
  },
  {
    id: 'number',
    label: 'A number',
    test: (pwd: string) => /\d/.test(pwd),
  },
  {
    id: 'special',
    label: 'A special character',
    test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  },
];

export const formatPhoneNumber = (value: string): string => {
  let cleaned = value.replace(/[^+\d]/g, '');
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  if (cleaned.length > 16) {
    cleaned = cleaned.substring(0, 16);
  }
  return cleaned;
};

export const validatePhone = (value: string): string | null => {
  if (value.length === 0) {
    return null;
  }
  if (!value.startsWith('+')) {
    return 'Phone number must start with + and country code';
  }
  const digits = value.replace(/\D/g, '');
  if (digits.length < 10) {
    return 'Phone number is too short';
  }
  if (digits.length > 15) {
    return 'Phone number is too long';
  }
  return null;
};

export const validateEmail = (value: string): string | null => {
  if (value.length === 0) {
    return null;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return 'Please enter a valid email address';
  }
  return null;
};
