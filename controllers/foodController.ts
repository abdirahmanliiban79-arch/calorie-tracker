import crypto from "crypto";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import sharp from "sharp";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2Config } from "../config/r2.js";
import { analyzeFoodImage } from "../services/openai.js";
import FoodEntry from "../models/FoodEntry.js";
import { getUserFoodEntries } from "../services/colories.js";




const optimeizeImage = async (buffer: Buffer): Promise<Buffer> => {

    const originalSize = buffer.length
    const optimeizedBuffer = await sharp(buffer)
        .rotate()
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer()

    const optimizedSize = optimeizedBuffer.length

    if (optimizedSize >= originalSize) {
        return buffer
    }
    return optimeizedBuffer
}

export const uploadImageToR2 = async (buffer: Buffer): Promise<{ url: string, key: string }> => {


    const fileName = `${crypto.randomBytes(16).toString('hex')}.jpeg`
    const key = `calorie-tracker/${fileName}`

    try {
        // upload r2
        const command = new PutObjectCommand({
            Bucket: r2Config.bucketName,
            Key: key,
            Body: buffer,
            ContentType: 'image/jpeg',
        })

        console.log('uploading to r2')

        await r2Config.client.send(command)

        const publicUrl = `${r2Config.publicUrl}/${key}`

        return { url: publicUrl, key }


    } catch (error) {
        console.log('error uploading to r2 ', error)
        throw new Error('Failed to upload image to r2')
    }

}

export const scanFood = async (req: Request, res: Response): Promise<void> => {

    // get image from req.body
    // optimize using sharp
    // upload to r2
    // call openai api to get food name
    // save food to database
    // return food name
    try {


        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' })
            return
        }

        const image = req.file?.buffer

        console.log('optimizing image..')


        // optimize image
        const optimeizedImage = await optimeizeImage(image)

        // upload to r2
        const { url, key } = await uploadImageToR2(optimeizedImage)
        console.log('image uploaded to r2')

        console.log('calling openai api..')
        console.log('analyzing food..')
        const foodAnalysis = await analyzeFoodImage(url)

        const foodEntry = new FoodEntry({
            userId: req.user?._id,
            foodName: foodAnalysis.foodName,
            calories: foodAnalysis.calories,
            protein: foodAnalysis.protein,
            carbs: foodAnalysis.carbs,
            fat: foodAnalysis.fat,
            mealType: foodAnalysis.mealType,
            imageUrl: url,
            storageKey: key,
        })
        await foodEntry.save()

        res.status(200).json({
            message: 'Food scanned successfully',
            food: foodEntry
        })
    } catch (error) {

        const message = error instanceof Error ? error.message : String(error)
        console.error('scanFood error:', message)
        res.status(500).json({ message: 'Failed to scan food image', error: message })
    }



}


export const scanAnalyzeFoodImage = async (req: Request, res: Response) => {
    try {



        const image = req.file?.buffer

        if (!image) {
            res.status(400).json({ message: 'No file uploaded' })
            return
        }


        if(!req.user?._id){
            res.status(401).json({ message: 'Unauthorized' })
            return
        }

        // optimize image
        const optimeizedImage = await optimeizeImage(image)

        // upload to r2
        const { url, key } = await uploadImageToR2(optimeizedImage)
        console.log('image uploaded to r2')

        console.log('calling openai api..')
        console.log('analyzing food..')
        const foodData = await analyzeFoodImage(url)



        const imageBase64 = `data:image/jpeg;base64,${optimeizedImage.toString('base64')}`


        res.status(200).json({
            message: 'Food scanned successfully',
            ...foodData,
            imageUrl: url,
            storageKey: key,
            imageBase64
        })
    } catch (error) {

        const message = error instanceof Error ? error.message : String(error)
        console.error('scanAnalyzeFoodImage error:', message)
        // upstream AI/vision failures surface as 502, everything else as 500
        const isUpstreamAiFailure = message.includes('Failed to analyze food image')
        res.status(isUpstreamAiFailure ? 502 : 500).json({
            message: isUpstreamAiFailure ? 'Failed to analyze food image' : 'Failed to scan food image',
            error: message
        })
    }
}


export const saveFoodEntries = async (req: Request, res: Response): Promise<void> => {
    try {
        const { foodName, calories, protein, fat, carbs, mealType, imageUrl, storageKey } = req.body
        if (
            !foodName ||
            calories === undefined || isNaN(Number(calories)) ||
            protein === undefined || isNaN(Number(protein)) ||
            carbs === undefined || isNaN(Number(carbs)) ||
            fat === undefined || isNaN(Number(fat)) ||
            !imageUrl || !storageKey
        ) {
            res.status(400).json({ message: 'Missing required fields' })
            return
        }
        const foodEntries = new FoodEntry({
            userId: req.user?._id,
            foodName: foodName,
            calories: calories,
            protein: protein,
            carbs: carbs,
            fat: fat,
            mealType: mealType || 'snack',
            imageUrl: imageUrl,
            storageKey: storageKey,
        })
        await foodEntries.save()
        res.status(200).json(foodEntries)
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error('scanFood error:', message)
        res.status(500).json({ message: 'Failed to scan food image', error: message })
    }
}


export const discardFoodEntry = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params

        if (!req.user?._id) {
            res.status(401).json({ message: 'Not authenticated' })
            return
        }

        // accept storageKey from either the request body or the query string
        const storageKey =
            req.body?.storageKey ||
            (typeof req.query.storageKey === 'string' ? req.query.storageKey : undefined)

        if (!id) {
            // no entry id: the image was analyzed but never saved, so only the R2 object exists
            if (!storageKey) {
                res.status(400).json({ message: 'storageKey is required when no entry id is provided' })
                return
            }
            const deleteCommand = new DeleteObjectCommand({
                Bucket: r2Config.bucketName,
                Key: storageKey,
            })
            await r2Config.client.send(deleteCommand)
            res.status(200).json({ success: true, message: 'Food image discarded successfully' })
            return
        }

        if (!mongoose.isValidObjectId(id)) {
            res.status(404).json({ message: 'Food entry not found' })
            return
        }

        // the entry must exist and belong to the authenticated user
        const entry = await FoodEntry.findOne({ _id: id, userId: req.user._id })
        if (!entry) {
            res.status(404).json({ message: 'Food entry not found' })
            return
        }

        if (storageKey) {
            const deleteCommand = new DeleteObjectCommand({
                Bucket: r2Config.bucketName,
                Key: storageKey,
            })
            await r2Config.client.send(deleteCommand)
        }

        await FoodEntry.deleteOne({ _id: entry._id })

        res.status(200).json({ success: true, message: 'Food entry discarded successfully' })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error('discardFoodEntry error:', message)
        res.status(500).json({ message: 'Failed to discard food entry', error: message })
    }
}


export const getFoodEntries = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?._id) {
            res.status(401).json({ message: 'Not authenticated' })
            return
        }

        const { date, limit } = req.query

        let parsedDate: Date | undefined
        if (typeof date === 'string' && date !== '') {
            parsedDate = new Date(date)
            if (isNaN(parsedDate.getTime())) {
                res.status(400).json({ message: 'Invalid date parameter, expected YYYY-MM-DD' })
                return
            }
        }

        let parsedLimit = 50
        if (typeof limit === 'string' && limit !== '') {
            parsedLimit = parseInt(limit, 10)
            if (isNaN(parsedLimit) || parsedLimit < 1) {
                res.status(400).json({ message: 'Invalid limit parameter' })
                return
            }
        }

        const { entries, totals } = await getUserFoodEntries(req.user._id, parsedDate, parsedLimit)

        res.status(200).json({
            success: true,
            data: {
                entries,
                totals: {
                    calories: totals.calories,
                    protein: totals.protein,
                    carbs: totals.carbs,
                    fat: totals.fat,
                },
            },
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error('getFoodEntries error:', message)
        res.status(500).json({ message: 'Failed to fetch food entries', error: message })
    }
}


export const getFoodEntry = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?._id) {
            res.status(401).json({ message: 'Not authenticated' })
            return
        }

        const { id } = req.params

        if (!id || !mongoose.isValidObjectId(id)) {
            res.status(404).json({ message: 'Food entry not found' })
            return
        }

        const entry = await FoodEntry.findOne({ _id: id, userId: req.user._id })

        if (!entry) {
            res.status(404).json({ message: 'Food entry not found' })
            return
        }

        res.status(200).json({
            success: true,
            data: { entry },
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error('getFoodEntry error:', message)
        res.status(500).json({ message: 'Failed to fetch food entry', error: message })
    }
}