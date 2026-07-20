export const validateProduct = (body) => {
  const errors = [];
  const { title, description, category, price, stock, sku } = body;

  if (!title || title.trim().length < 3) {
    errors.push("Title must be at least 3 characters");
  }
  if (!description || description.trim().length < 10) {
    errors.push("Description must be at least 10 characters");
  }
  if (!category) {
    errors.push("Category is required");
  }
  if (price === undefined || Number(price) <= 0) {
    errors.push("Price must be a positive number");
  }
  if (body.discountPrice !== undefined && Number(body.discountPrice) >= Number(price)) {
    errors.push("Discount price must be lower than the regular price");
  }
  if (stock === undefined || Number(stock) < 0) {
    errors.push("Stock cannot be negative");
  }
  if (sku !== undefined && sku.trim().length === 0) {
    errors.push("SKU cannot be empty if provided");
  }

  return errors;
};

export const validateReview = (body) => {
  const errors = [];
  const { rating } = body;

  if (rating === undefined || rating < 1 || rating > 5) {
    errors.push("Rating must be between 1 and 5");
  }

  return errors;
};
