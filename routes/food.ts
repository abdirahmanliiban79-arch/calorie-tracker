import express from 'express';
import { protect } from '../middlewares/auth.js';
import { discardFoodEntry, saveFoodEntries, scanAnalyzeFoodImage, scanFood, getFoodEntries, getFoodEntry } from '../controllers/foodController.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

router.get('/', protect, getFoodEntries)
router.get('/:id', protect, getFoodEntry)
router.post('/scan',protect,upload.single('image'),scanFood)
router.post('/save',protect ,saveFoodEntries)
router.post('/analyze-food',protect ,upload.single('image'),scanAnalyzeFoodImage)
router.delete('/discard',protect ,discardFoodEntry)
router.delete('/discard/:id',protect ,discardFoodEntry)


export default router