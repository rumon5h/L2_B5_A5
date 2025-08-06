import z from "zod";
import { IsBlocked, Role } from "./user.interface";

export const createUserZodSchema = z.object({
    name: z
        .string({ message: "Name must be string" })
        .min(2, { message: "Name must be at least 2 characters long." })
        .max(50, { message: "Name cannot exceed 100 characters." }),
    email: z
        .string({ message: "Email must be string" })
        .email({ message: "Invalid email address format." }),
    password: z
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
    phone: z
        .string({ message: "Phone Number must be string" })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
            message: "Phone number is not valid. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
        })
        .optional(),
    location: z
        .object({
            type: z.literal("Point"),
            coordinates: z
                .tuple([z.number(), z.number()])
                .refine((coords) => coords.length === 2, {
                    message: "Coordinates must be [longitude, latitude]",
                }),
        })
        .optional(),
})

export const updateUserZodSchema = z.object({
    name: z
        .string({ message: "Name must be string" })
        .min(2, { message: "Name must be at least 2 characters long." })
        .max(50, { message: "Name cannot exceed 50 characters." }).optional(),
    phone: z
        .string({ message: "Phone Number must be string" })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
            message: "Phone number is not valid. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
        })
        .optional(),
    role: z
        .enum(Object.values(Role) as [string])
        .optional(),
    isBlocked: z
        .enum(Object.values(IsBlocked) as [string])
        .optional(),
    isVerified: z
        .boolean({ message: "isVerified must be true or false" })
        .optional(),
    location: z
        .object({
            type: z.literal("Point"),
            coordinates: z
                .tuple([z.number(), z.number()])
                .refine((coords) => coords.length === 2, {
                    message: "Coordinates must be [longitude, latitude]",
                }),
        })
        .optional(),
})
export const updateOwnProfileUserZodSchema = z.object({
    name: z
        .string({ message: "Name must be string" })
        .min(2, { message: "Name must be at least 2 characters long." })
        .max(50, { message: "Name cannot exceed 50 characters." }).optional(),
    phone: z
        .string({ message: "Phone Number must be string" })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
            message: "Phone number is not valid. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
        })
        .optional(),
    location: z
        .object({
            type: z.literal("Point"),
            coordinates: z
                .tuple([z.number(), z.number()])
                .refine((coords) => coords.length === 2, {
                    message: "Coordinates must be [longitude, latitude]",
                }),
        })
        .optional(),
})