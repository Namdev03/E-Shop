import { ApiError } from "../utils/ApiError.js";

/**
 * Wraps a plain validator function (from /validators) as Express middleware.
 * The validator receives req.body and returns an array of error strings
 * (empty array = valid). Usage:
 *
 *   router.post("/register", validate(validateUserSignup), registerUser)
 */
export const validate = (validatorFn) => (req, res, next) => {
  const errors = validatorFn(req.body) || [];

  if (errors.length > 0) {
    throw new ApiError(400, errors.join(", "));
  }

  next();
};
