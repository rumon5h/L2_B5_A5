"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rideFeedbackSchema = exports.createRideZodSchema = void 0;
const zod_1 = require("zod");
exports.createRideZodSchema = zod_1.z.object({
    pickupLocation: zod_1.z.object({
        type: zod_1.z.literal("Point"),
        coordinates: zod_1.z
            .tuple([zod_1.z.number(), zod_1.z.number()])
            .refine(val => val.length === 2, {
            message: "Coordinates must have [longitude, latitude]",
        }),
    }),
    destination: zod_1.z.object({
        type: zod_1.z.literal("Point"),
        coordinates: zod_1.z
            .tuple([zod_1.z.number(), zod_1.z.number()])
            .refine(val => val.length === 2, {
            message: "Coordinates must have [longitude, latitude]",
        }),
    }),
});
exports.rideFeedbackSchema = zod_1.z.object({
    feedback: zod_1.z.string(),
    rating: zod_1.z
        .number({
        message: "Rating must be number",
    })
        .min(1, "Rating must be at least 1")
        .max(5, "Rating must be at most 5"),
});
