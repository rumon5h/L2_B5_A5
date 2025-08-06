import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/appErrors";
import { IsBlocked, IUser } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { generateToken, verifyToken } from "./jwt";
import httpStatus from 'http-status-codes';

export const createUserToken = (user: Partial<IUser>) => {
    const jwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role
    }
    const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET as string, envVars.JWT_ACCESS_EXPIRES as string)
    console.log("Access Token Created: ", accessToken)

    const refreshToken = generateToken(jwtPayload, envVars.JWT_REFRESH_SECRET as string, envVars.JWT_REFRESH_EXPIRES as string)

    return {
        accessToken,
        refreshToken
    }
}

export const createNewAccessTokenWithRefreshToken = async (refreshToken: string) => {
    const verifiedRefreshToken = verifyToken(refreshToken, envVars.JWT_REFRESH_SECRET as string) as JwtPayload

    const isUserExist = await User.findOne({ email: verifiedRefreshToken.email })
    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User Does Not Exist")
    }

    if (isUserExist.isBlocked === IsBlocked.BLOCKED) {
        throw new AppError(httpStatus.BAD_REQUEST, `User Is ${isUserExist.isBlocked}`)
    }

    const jwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role
    }
    const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET as string, envVars.JWT_ACCESS_EXPIRES as string)
    return accessToken

}