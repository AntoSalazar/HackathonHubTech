// routes/AuthRoutes.ts
import { Router } from 'express';
import { AuthController } from '../controller/AuthController';
import { authenticate } from '../middleware/authentication';
import { body } from 'express-validator';

const router = Router();

// Validation for signup
const signupValidation = [
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

// Validation for login
const loginValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// Public routes
router.post('/signup', signupValidation, AuthController.signup);
router.post('/login', loginValidation, AuthController.login);

// Protected routes
router.get('/profile', authenticate, AuthController.getProfile);

export default router;