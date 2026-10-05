import type {Request,Response,NextFunction} from "express"
import jwt from "jsonwebtoken"
import type { IUser } from "../models/User.js"
import User from "../models/User.js"

declare global {
  namespace Express {
    interface Request {
      user?: IUser
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
  let token = undefined

  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    try {
      token = req.headers.authorization.split(' ')[1];

      if(!token) {
        res.status(401).json({message: 'No token provided'})
        return 
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || '' ) as {id : string};
      const user = await User.findById(decoded.id).select('-password')
      if(!user){
        res.status(404).json({message: 'User not found'})
        return
      }
      req.user = user;
      next();
    } catch (error: any) {
      res.status(401).json({message: 'Invalid token'})
    }
  }else{
    res.status(401).json({message: 'Not authorized ❌ no token provided 👎🏻'})   
  }
}