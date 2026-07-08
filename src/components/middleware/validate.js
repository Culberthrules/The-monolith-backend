import { validationResult } from 'express-validator';
import { sendError } from '../../../utilis/response.js';

/**
 * Collects express-validator errors and short-circuits with 422
 * if any validation rules were violated.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return sendError(res, firstError.msg, 422);
  }

  next();
};

export default validate;
