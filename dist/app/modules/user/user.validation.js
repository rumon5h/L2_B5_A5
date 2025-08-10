"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOwnProfileUserZodSchema = exports.updateUserZodSchema = exports.createUserZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const user_interface_1 = require("./user.interface");
exports.createUserZodSchema = zod_1.default.object({
    name: zod_1.default
        .string({ message: "Name must be string" })
        .min(2, { message: "Name must be at least 2 characters long." })
        .max(50, { message: "Name cannot exceed 100 characters." }),
    email: zod_1.default
        .string({ message: "Email must be string" })
        .email({ message: "Invalid email address format." }),
    password: zod_1.default
        .string({ message: "Password must be string" })
        .min(9, { message: "Password must be at least 9 characters long." })
        .regex(/^(?=.*[A-Z])/, {
        message: "Password must contain at least 1 uppercase letter.",
    })
        .regex(/^(?=.*[!@#$%^&*])/, {
        message: "Password must contain at least 1 special character.",
    })
        .regex(/^(?=.*\d)/, {
        message: "Password must contain at least 1 number.",
    }),
    phone: zod_1.default
        .string({ message: "Phone Number must be string" })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
        message: "Phone number is not valid. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
        .optional(),
    location: zod_1.default
        .object({
        type: zod_1.default.literal("Point"),
        coordinates: zod_1.default
            .tuple([zod_1.default.number(), zod_1.default.number()])
            .refine((coords) => coords.length === 2, {
            message: "Coordinates must be [longitude, latitude]",
        }),
    })
        .optional(),
});
exports.updateUserZodSchema = zod_1.default.object({
    name: zod_1.default
        .string({ message: "Name must be string" })
        .min(2, { message: "Name must be at least 2 characters long." })
        .max(50, { message: "Name cannot exceed 50 characters." }).optional(),
    phone: zod_1.default
        .string({ message: "Phone Number must be string" })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
        message: "Phone number is not valid. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
        .optional(),
    role: zod_1.default
        .enum(Object.values(user_interface_1.Role))
        .optional(),
    isBlocked: zod_1.default
        .enum(Object.values(user_interface_1.IsBlocked))
        .optional(),
    isVerified: zod_1.default
        .boolean({ message: "isVerified must be true or false" })
        .optional(),
    location: zod_1.default
        .object({
        type: zod_1.default.literal("Point"),
        coordinates: zod_1.default
            .tuple([zod_1.default.number(), zod_1.default.number()])
            .refine((coords) => coords.length === 2, {
            message: "Coordinates must be [longitude, latitude]",
        }),
    })
        .optional(),
});
exports.updateOwnProfileUserZodSchema = zod_1.default.object({
    name: zod_1.default
        .string({ message: "Name must be string" })
        .min(2, { message: "Name must be at least 2 characters long." })
        .max(50, { message: "Name cannot exceed 50 characters." })
        .optional(),
    phone: zod_1.default
        .string({ message: "Phone Number must be string" })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
        message: "Phone number is not valid. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
        .optional(),
    location: zod_1.default
        .object({
        type: zod_1.default.literal("Point"),
        coordinates: zod_1.default
            .tuple([zod_1.default.number(), zod_1.default.number()])
            .refine((coords) => coords.length === 2, {
            message: "Coordinates must be [longitude, latitude]",
        }),
    })
        .optional(),
});
