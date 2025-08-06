import AppError from "../..//errorHelpers/appErrors";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatus from 'http-status-codes';
import bcryptjs from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";
import { userSearchableFields } from "./user.constant";
import { QueryBuilder } from "../../utils/QueryBuilder";

// Function to create a new user
const createUser = async (payload: Partial<IUser>) => {

    const { email, password, ...rest } = payload

    const isUserExist = await User.findOne({ email })

    if (isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User Already Exists")
    }

    const hashedPassword = await bcryptjs.hash(password as string, 10)

    const authProvider: IAuthProvider = { provider: "credentials", providerId: email as string }

    const user = await User.create({
        email,
        password: hashedPassword,
        auths: [authProvider],
        ...rest
    })

    return user
}

// Function to get all users with pagination, filtering, and sorting
// It uses a QueryBuilder to build the query based on the provided filters and options
const getAllUsers = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(User.find(), query)
    const usersData = queryBuilder
        .filter()
        .search(userSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data] = await Promise.all([
        usersData.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        // meta
    }
};

// Function to update a user by ID
const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {

    const ifUserExist = await User.findById(userId);

    // new
    if (decodedToken.role === Role.RIDER || decodedToken.role === Role.DRIVER) {
        if (userId !== decodedToken.userId) {
            throw new AppError(httpStatus.FORBIDDEN, "You are unauthorized to update another user's profile");
        }
    }

    if (!ifUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User not Found")
    }

    if (payload.role) {
        if (decodedToken.role === Role.RIDER || decodedToken.role === Role.DRIVER) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
        }
    }

    if (payload.isBlocked || payload.isVerified) {
        if (decodedToken.role === Role.RIDER || decodedToken.role === Role.DRIVER) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
        }
    }

    const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true })

    return newUpdatedUser
}

// Function to get a single user by ID
const getSingleUser = async (id: string) => {
    const user = await User.findById(id).select("-password");
    return {
        data: user
    }
};
const getMe = async (userId: string) => {
    const user = await User.findById(userId).select("-password");
    return {
        data: user
    }
};

// Function to update the status of a user (block/unblock)
export const updateUserStatus = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {
    const ifUserExist = await User.findById(userId);

    if (!ifUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (decodedToken.userId.toString() === ifUserExist._id.toString()) {
        throw new AppError(httpStatus.FORBIDDEN,"You cannot change your own block status");
    }

    if (payload.isBlocked === ifUserExist.isBlocked) {
        throw new AppError(httpStatus.BAD_REQUEST, `User is already ${payload.isBlocked ? "blocked" : "unblocked"}`);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, payload, {
        new: true,
        runValidators: true,
    });

    return updatedUser;
};
export const userServices = {
    createUser,
    getAllUsers,
    updateUser,
    getSingleUser,
    getMe,
    updateUserStatus
}