"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDriverStatusZodSchema = exports.updateDriverProfileZodSchema = exports.goOnlineZodSchema = exports.createDriverZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const driver_interface_1 = require("./driver.interface");
exports.createDriverZodSchema = zod_1.default.object({
    userId: zod_1.default.string().optional(),
    vehicle: zod_1.default.object({
        vehicleNumber: zod_1.default
            .string({ message: "Vehicle number is required" }),
        vehicleType: zod_1.default.enum(Object.values(driver_interface_1.VehicleType)),
    }),
    currentLocation: zod_1.default
        .object({
        type: zod_1.default.literal("Point"),
        coordinates: zod_1.default
            .tuple([zod_1.default.number(), zod_1.default.number()])
            .refine((coords) => coords.length === 2, {
            message: "Coordinates must be [longitude, latitude]",
        }),
    })
        .optional(),
    totalEarning: zod_1.default.number().min(0).optional(),
    drivingLicense: zod_1.default
        .string().optional()
});
exports.goOnlineZodSchema = zod_1.default
    .object({
    type: zod_1.default.literal("Point"),
    coordinates: zod_1.default
        .tuple([zod_1.default.number(), zod_1.default.number()])
        .refine((coords) => coords.length === 2, {
        message: "Coordinates must be [longitude, latitude]",
    }),
});
exports.updateDriverProfileZodSchema = zod_1.default.object({
    name: zod_1.default.string().optional(),
    vehicle: zod_1.default
        .object({
        vehicleNumber: zod_1.default.string().min(4).optional(),
        vehicleType: zod_1.default.enum(Object.values(driver_interface_1.VehicleType)).optional(),
    })
        .optional(),
    drivingLicense: zod_1.default.string().optional(),
});
exports.updateDriverStatusZodSchema = zod_1.default.object({
    driverStatus: zod_1.default.enum(Object.values(driver_interface_1.DriverStatus), {
        message: "Driver status is required or invalid",
    }),
});
