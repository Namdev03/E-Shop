const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9]{10,15}$/;
// At least 8 chars, one uppercase, one lowercase, one number, one special char
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export const validateSignup = (body) => {
  const errors = [];
  const { fullName, email, phone, password, confirmPassword } = body;

  if (!fullName || fullName.trim().length < 2) {
    errors.push("Full name must be at least 2 characters");
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    errors.push("A valid email is required");
  }
  if (!phone || !PHONE_REGEX.test(phone)) {
    errors.push("A valid phone number is required");
  }
  if (!password || !STRONG_PASSWORD_REGEX.test(password)) {
    errors.push(
      "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character"
    );
  }
  if (password !== confirmPassword) {
    errors.push("Password and confirm password do not match");
  }

  return errors;
};

export const validateSellerSignup = (body) => {
  const errors = validateSignup(body);
  if (!body.storeName || body.storeName.trim().length < 2) {
    errors.push("Store name must be at least 2 characters");
  }
  return errors;
};

export const validateLogin = (body) => {
  const errors = [];
  const { emailOrPhone, password } = body;

  if (!emailOrPhone) {
    errors.push("Email or phone number is required");
  }
  if (!password) {
    errors.push("Password is required");
  }

  return errors;
};
