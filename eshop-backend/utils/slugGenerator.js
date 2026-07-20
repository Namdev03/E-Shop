import slugify from "slugify";
import crypto from "crypto";

/**
 * Appends a short random suffix so two products with the same title
 * never collide on slug (uniqueness is still enforced at the DB level
 * as a safety net).
 */
export const generateUniqueSlug = (title) => {
  const base = slugify(title, { lower: true, strict: true });
  const suffix = crypto.randomBytes(3).toString("hex");
  return `${base}-${suffix}`;
};

export const generateSku = (prefix = "SKU") => {
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${random}`;
};
