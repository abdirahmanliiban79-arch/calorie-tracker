import { Document, Types, Schema } from "mongoose";
import bcryptjs from "bcryptjs";
import mongoose from "mongoose";

export interface IUser extends Document {
    name: string,
    email: string,
    password: string,
    dailyColorieGoal: number,
    onboardingCompleted: boolean,
    createdAt: Date,
    comparePassword(candidatePassword: string): Promise<boolean>

}

const userSchema = new Schema<IUser>({
    name: { type: String, trim: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true, match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"] },
    password: { type: String, required: true, minLength: 8 },
    dailyColorieGoal: { type: Number, default: 2000 },
    onboardingCompleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
})

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
})

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return await bcryptjs.compare(candidatePassword, this.password);
}

export default mongoose.model<IUser>('User', userSchema)
