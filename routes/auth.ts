import express from 'express'
import { registerUser,loginUser,getMe, updateProfile } from '../controllers/auth.js'
import { protect } from '../middlewares/auth.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/me', protect, getMe)
router.put('/update-profile', protect, updateProfile)

export default router
