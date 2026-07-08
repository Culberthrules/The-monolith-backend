/**
 * Send a standardised success response.
 * @param {import('express').Response} res
 * @param {object}  data       - Payload to include under `data`
 * @param {number}  statusCode - HTTP status (default 200)
 */
export const sendSuccess = (res, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, ...data });
};

/**
 * Send a standardised error response.
 * @param {import('express').Response} res
 * @param {string}  message    - Human-readable error message
 * @param {number}  statusCode - HTTP status (default 500)
 */
export const sendError = (res, message = 'Server error', statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};
