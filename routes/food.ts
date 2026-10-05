import express from 'express';
import { protect } from '../middlewares/auth.js';
import { discardFoodEntry, saveFoodEntries, scanAnalyzeFoodImage, scanFood } from '../controllers/foodController.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

router.post('/scan',protect,upload.single('image'),scanFood)
router.post('/save',protect ,saveFoodEntries)
router.delete('/discard',protect ,discardFoodEntry)
router.post('/analyze',protect ,upload.single('image'),scanAnalyzeFoodImage)


export default router