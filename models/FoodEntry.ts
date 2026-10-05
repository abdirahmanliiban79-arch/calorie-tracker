import mongoose, {Document , Schema, Types} from "mongoose";

export type mealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface IFoodEntry extends Document {
    userId : Types.ObjectId
    foodName : string
    calories : number
    protein : number
    carbs : number
    fat : number
    mealType : mealType
    imageUrl : string
    storageKey? : string
    timestamp : Date
}

const foodEntrySchema = new Schema<IFoodEntry>({
    userId : {
        type : Types.ObjectId,
        ref : 'User',
        required : true
    },
    foodName : {
        type : String,
        required : [ true , 'food name is required']
    },
    calories : {
        type : Number,
        required : [ true , 'calories is required'],
        min : [0 , 'calories cannot be negative'],
    },
    protein : {
        type : Number,
        required : [ true , 'protein is required'],
        min : [0 , 'protein cannot be negative'],
    },
    carbs : {
        type : Number,
        required : [ true , 'carbs is required'],
        min : [0 , 'carbs cannot be negative'],
    },
    fat : {
        type : Number,
        required : [ true , 'fat is required'],
        min : [0 , 'fat cannot be negative'],
    },
    mealType : {
        type : String,
        enum : ['breakfast', 'lunch', 'dinner', 'snack'],
        required : true
    },
    imageUrl : {
        type : String,
        required : true
    },
    storageKey : {
        type : String,
    },
    timestamp : {
        type : Date,
        default : Date.now,
        index : true
    }
})


foodEntrySchema.index({ user : 1 , timestamp : -1})

export default mongoose.model<IFoodEntry>('FoodEntry' , foodEntrySchema)
