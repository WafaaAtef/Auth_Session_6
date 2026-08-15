import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import { nextTick } from "node:process";

const auth = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ msg: "No token provided" })
    }
    try {
        const verify = jwt.verify(token, process.env.JWT_SECRET as string)
        if (!verify) {
            return res.status(401).json({ msg: "Invalid token" })
        }
        next();
    } catch {
        return res.status(401).json({ msg: "Invalid token" })
    }
}

const authorize = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ msg: "No token provided" })
    }
    try {
        const verify = jwt.verify(
            token, process.env.JWT_SECRET as string
        ) as { role: string }
        if (verify.role !== "admin") {
            return res.status(403).json({ msg: "Access denied" })
        }
        next();
    } catch {
        return res.status(401).json({ msg: "Invalid token" })
    }
}

export {auth, authorize}