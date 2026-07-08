import { db } from '../../../config/db.js';
import { verifyToken } from '../../../utilis/jwt.js';
import { sendError } from '../../../utilis/response.js';

/**
 * Authenticate middleware.
 * Reads JWT from the `token` httpOnly cookie, verifies it,
 * fetches the matching user and attaches it to `req.user`.
 */
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return sendError(res, 'Not authenticated. Please log in.', 401);
    }

    const decoded = verifyToken(token);

    // Re-fetch user so we always have fresh data (e.g. role changes)
    const userSnap = await db.collection('users').doc(decoded.id).get();

    if (!userSnap.exists) {
      return sendError(res, 'User no longer exists.', 401);
    }

    const userData = userSnap.data();
    
    // Attach user data to request
    req.user = {
      id: decoded.id,
      ...userData,
    };
    
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Session expired. Please log in again.', 401);
    }
    return sendError(res, 'Invalid token. Please log in again.', 401);
  }
};

export default authenticate;
