import { Router } from 'express'
import { requireAuth } from './auth.js'
import { registerController, verifyOtpController, currentUserController, logoutController } from './controllers/authController.js'
import { checkRegisteredEmailController } from './controllers/userController.js'
import { checkoutController } from './controllers/checkoutController.js'

export const router = Router()
router.get('/health', (_request, response) => response.json({ ok: true }))
router.post('/auth/register', registerController)
router.post('/auth/verify-otp', verifyOtpController)
router.get('/auth/me', requireAuth, currentUserController)
router.post('/auth/logout', logoutController)
router.get('/users/check', checkRegisteredEmailController)
router.post('/checkout', requireAuth, checkoutController)
