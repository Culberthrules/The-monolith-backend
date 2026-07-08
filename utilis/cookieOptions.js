const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Standard options for the auth httpOnly cookie.
 * - httpOnly  : JS cannot read it (XSS protection)
 * - secure    : HTTPS-only in production
 * - sameSite  : strict CSRF protection
 * - maxAge    : 7 days, matching JWT_EXPIRES_IN
 */
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: ONE_WEEK_MS,
};

/**
 * Options for clearing the auth cookie (logout).
 * maxAge: 0 forces immediate expiry.
 */
export const clearCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 0,
};
