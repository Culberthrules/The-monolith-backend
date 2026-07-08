import { Router } from 'express';
import { submitInquiry } from '../controllers/contact.controller.js';
import validate from '../src/components/middleware/validate.js';
import { contactValidator } from '../validators/contact.validator.js';

const router = Router();

// POST /api/contact
router.post('/', contactValidator, validate, submitInquiry);

export default router;
