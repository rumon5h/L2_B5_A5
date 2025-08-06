import { JwtPayload } from 'jsonwebtoken';
import { NextFunction, Request, Response } from "express";
import AppError from '../errorHelpers/appErrors';
import { verifyToken } from '../utils/jwt';
import { envVars } from '../config/env';
import httpStatus from 'http-status-codes';
import { IsBlocked } from '../modules/user/user.interface';
import { User } from '../modules/user/user.model';

export const checkAuth = (...authRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.headers.authorization;

        if (!accessToken) {
            throw new AppError(403, "No Token Received")
        }
        const verifiedToken = verifyToken(accessToken, envVars.JWT_ACCESS_SECRET as string) as JwtPayload
        const isUserExist = await User.findOne({ email: verifiedToken.email })
        if (!isUserExist) {
            throw new AppError(httpStatus.BAD_REQUEST, "User does not Exist")
        }

        if (!isUserExist.isVerified) {
            throw new AppError(httpStatus.BAD_REQUEST, "User is not verified")
        }

        if (isUserExist.isBlocked === IsBlocked.BLOCKED) {
            throw new AppError(httpStatus.BAD_REQUEST, `User Is ${isUserExist.isBlocked}`)
        }

        if (!authRoles.includes(verifiedToken.role)) {
            throw new AppError(403, "You are not permitted to view this route ")
        }

        req.user = verifiedToken

        next()
    } catch (error) {
        next(error)
    }
}