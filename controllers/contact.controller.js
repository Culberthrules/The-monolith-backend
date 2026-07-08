import { sendSuccess, sendError } from '../utilis/response.js';
import { db } from '../config/db.js';

/**
 * POST /api/contact
 * Submit a contact inquiry
 */
export const submitInquiry = async (req, res) => {
  try {
    const { name, email, projectType, message } = req.body;

    // Create inquiry document in Firestore
    const docRef = await db.collection('inquiries').add({
      name,
      email,
      projectType: projectType || null,
      message,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return sendSuccess(res, {
      message: 'Inquiry submitted successfully',
      inquiryId: docRef.id,
    }, 201);
  } catch (error) {
    console.error('Submit inquiry error:', error);
    return sendError(res, error.message || 'Failed to submit inquiry', 500);
  }
};
