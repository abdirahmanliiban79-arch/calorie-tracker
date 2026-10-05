import { z } from "zod"
import { OpenAI } from 'openai'

const foodAnalysisSchema = z.object({
    foodName: z.string().describe('name of the food'),
    calories: z.number().describe('approximate calories of the food in kcal'),
    protein: z.number().describe('approximate protein of the food in grams'),
    carbs: z.number().describe('approximate carbs of the food in grams'),
    fat: z.number().describe('approximate fat of the food in grams'),
    mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).describe('type of meal'),
})

type FoodAnalysis = z.infer<typeof foodAnalysisSchema>

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
        'HTTP-Referer': 'https://calorie-tracker.app',
        'X-Title': 'Calorie Tracker',
    }
})

export const analyzeFoodImage = async (imageUrl: string): Promise<FoodAnalysis> => {

    try {

        const response = await openai.chat.completions.create({
            model: 'openai/gpt-4o-mini',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `Analyze this image of food and return a JSON object with exactly these fields:
- foodName (string): name of the food
- calories (number): approximate calories in kcal
- protein (number): approximate protein in grams
- carbs (number): approximate carbs in grams
- fat (number): approximate fat in grams
- mealType (string): one of "breakfast", "lunch", "dinner", or "snack"

Respond with ONLY valid JSON, no markdown, no code blocks.`,
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: imageUrl,
                                detail: 'low'
                            },
                        },
                    ],
                },
            ],
            response_format: { type: 'json_object' },
            max_tokens: 300,
        })

        const content = response.choices[0]?.message?.content

        if (!content) {
            throw new Error('No content returned from OpenRouter')
        }

        const parsed = foodAnalysisSchema.safeParse(JSON.parse(content))

        if (!parsed.success) {
            throw new Error(`Invalid response structure: ${parsed.error.message}`)
        }

        return parsed.data

    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error('openai error:', message)
        throw new Error(`Failed to analyze food image: ${message}`)
    }

}


