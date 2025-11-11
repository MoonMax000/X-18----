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
