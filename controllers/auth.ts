import type { Request, Response, NextFunction } from "express"
import User from "../models/User.js"
import jwt from "jsonwebtoken"
import { env } from "../config/env.js"

const generateToken = (id: string) => {
    return jwt.sign({ id }, env.jwtSecret as string, { expiresIn: "7d" })
}

export const registerUser = async (req: Request, res: Response) : Promise<void> => {
    try {
        const { name, email, password , dailyColorieGoal} = req.body;
        if (!name || !email || !password) {
              res.status(400).json({ message: "Please provide all the required fields" })
            return 
          
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() })
        if (existingUser) {
            res.status(400).json({ message: "User already exists👎🏻" })
            return 
          
        }

        const user = await User.create({
            name,
            email,
            password,
            dailyColorieGoal: dailyColorieGoal || 2000
        })

        

        console.log(`user created ${user.name} 👨🏾‍🦱 `)

        res.status(201).json({
            message: "User created successfully✅",
            user:{
                name:user.name,
                email:user.email,
                token:generateToken(user._id.toString())
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const loginUser = async (req: Request, res: Response) : Promise<void> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "Please provide all the required fields" })
            return 
          
        }

        const user = await User.findOne({ email: email.toLowerCase() })
        if (!user) {
            res.status(401).json({ message: "Make sure your email is correct 👍🏻" })
            return 
          
        }

        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            res.status(401).json({ message: "Make sure your password is correct 👍🏻" })
            return 
          
        }

        console.log(`user logged in ${user.name} 👨🏾‍🦱 `)

        res.status(200).json({
            message: "User logged in successfully✅",
            user:{
                name:user.name,
                email:user.email,
                token:generateToken(user._id.toString())
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}


export const getMe = async (req: Request, res: Response) : Promise<void> => {
    try {
        const user = await User.findById(req.user?._id).select('-password')
        if(!user){
            res.status(404).json({message: 'User not found'})
            return
        }
        res.status(200).json(user)
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}