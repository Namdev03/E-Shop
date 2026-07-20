const ROLE_KEY = "eshop_role";

// Only the role string lives here — actual auth is in httpOnly cookies.
export const setStoredRole = (role) => localStorage.setItem(ROLE_KEY, role);
export const getStoredRole = () => localStorage.getItem(ROLE_KEY);
export const clearStoredRole = () => localStorage.removeItem(ROLE_KEY);
