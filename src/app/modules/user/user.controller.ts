/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes"
import { userServices } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";


// Controller for creating a new user
const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await userServices.createUser(req.body)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User created Successfully",
        data: user
    })
})

// Controller for updating a user
// This function updates a user based on the user ID and payload provided in the request
// It also verifies the token of the user making the request

const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id
    const verifiedToken = req.user
    console.log("verifiedToken", verifiedToken)

    const payload = req.body
    const user = await userServices.updateUser(userId, payload, verifiedToken as JwtPayload)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User updated Successfully",
        data: user
    })
})

// Controller for getting all users

const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await userServices.getAllUsers(query as Record<string, string>);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "All users retrieved successfully",
        data: result.data,
        // meta: result.meta
    })
})

// Controller for getting a single user by ID
const getSingleUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await userServices.getSingleUser(id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User retrieved successfully",
        data: result.data
    })
})

// Controller for getting the current user's profile
const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload
    const result = await userServices.getMe(decodedToken.userId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Your profile retrieved successfully",
        data: result.data
    })
})

// Controller for updating the status of a user
const updateUserStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const verifiedToken = req.user as JwtPayload;
    const payload = req.body;

    const user = await userServices.updateUserStatus(userId, payload, verifiedToken);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User updated successfully",
        data: user,
    });
});

export const userControllers = {
    createUser,
    getAllUsers,
    updateUser,
    getMe,
    getSingleUser,
    updateUserStatus
}