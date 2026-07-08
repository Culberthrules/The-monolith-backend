import { sendSuccess, sendError } from '../utilis/response.js';
import { signToken } from '../utilis/jwt.js';
import { db, auth } from '../config/db.js';

/**
 * POST /api/auth/signup
 * Register a new user with Firebase Auth + Firestore
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Create user in Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Create user document in Firestore
    const userData = {
      uid: userRecord.uid,
      name,
      email,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('users').doc(userRecord.uid).set(userData);

    // Generate JWT token
    const token = signToken({
      id: userRecord.uid,
      email,
      role: 'user',
    });

    return sendSuccess(res, {
      message: 'User registered successfully',
      user: {
        id: userRecord.uid,
        name,
        email,
      },
      token,
    }, 201);
  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/email-already-exists') {
      return sendError(res, 'Email already registered', 409);
    }
    if (error.code === 'auth/invalid-password') {
      return sendError(res, 'Password must be at least 6 characters', 400);
    }
    if (error.code === 'auth/invalid-email') {
      return sendError(res, 'Invalid email address', 400);
    }
    
    return sendError(res, error.message || 'Signup failed', 500);
  }
};

/**
 * POST /api/auth/login
 * Authenticate user with Firebase Auth
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    try {
      // Get user by email from Firebase Auth
      const userRecord = await auth.getUserByEmail(email);

      // Fetch user data from Firestore
      const userDoc = await db.collection('users').doc(userRecord.uid).get();

      if (!userDoc.exists) {
        return sendError(res, 'User profile not found', 404);
      }

      const userData = userDoc.data();

      // Generate JWT token
      const token = signToken({
        id: userRecord.uid,
        email: userData.email,
        role: userData.role,
      });

      return sendSuccess(res, {
        message: 'Login successful',
        user: {
          id: userRecord.uid,
          name: userData.name,
          email: userData.email,
        },
        token,
      }, 200);
    } catch (firebaseError) {
      // Firebase Auth user not found
      if (firebaseError.code === 'auth/user-not-found') {
        return sendError(res, 'Invalid email or password', 401);
      }
      throw firebaseError;
    }
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, error.message || 'Login failed', 401);
  }
};

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
export const logout = async (req, res) => {
  try {
    // Token invalidation can be handled client-side by removing the token
    // Or implement token blacklist on server if needed

    return sendSuccess(res, {
      message: 'Logout successful',
    }, 200);
  } catch (error) {
    console.error('Logout error:', error);
    return sendError(res, 'Logout failed', 500);
  }
};

/**
 * GET /api/auth/me
 * Get current user info (protected route)
 */
export const me = async (req, res) => {
  try {
    // req.user is set by authenticate middleware
    if (!req.user) {
      return sendError(res, 'User not found', 404);
    }

    // Fetch user details from Firestore
    const userDoc = await db.collection('users').doc(req.user.id).get();

    if (!userDoc.exists) {
      return sendError(res, 'User not found', 404);
    }

    const userData = userDoc.data();

    return sendSuccess(res, {
      user: {
        id: userDoc.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      },
    }, 200);
  } catch (error) {
    console.error('Me error:', error);
    return sendError(res, 'Failed to fetch user', 500);
  }
};
