import multer from "multer";
import path from "path";
import type { Request } from "express";

const storage = multer.memoryStorage()


const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) :void =>{


    const allowedExtensions = ['.jpeg', '.jpg', '.png']
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png']

    const extname = allowedExtensions.includes(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedMimeTypes.includes(file.mimetype)


    if(extname && mimetype){
       return cb(null , true)
    }else{
        cb(new Error('Invalid file type'))
    }
}


export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5
    }
})