import z from "zod";
import { DriverStatus, VehicleType } from "./driver.interface";

export const createDriverZodSchema = z.object({
  userId: z.string().optional(),

  vehicle: z.object({
    vehicleNumber: z
      .string({ message: "Vehicle number is required" }),
    vehicleType: z.enum(Object.values(VehicleType) as [string]),
  }),

  currentLocation: z
    .object({
      type: z.literal("Point"),
      coordinates: z
        .tuple([z.number(), z.number()])
        .refine((coords) => coords.length === 2, {
          message: "Coordinates must be [longitude, latitude]",
        }),
    })
    .optional(),

  totalEarning: z.number().min(0).optional(),

  drivingLicense: z
    .string().optional()

});

export const goOnlineZodSchema = z
  .object({
    type: z.literal("Point"),
    coordinates: z
      .tuple([z.number(), z.number()])
      .refine((coords) => coords.length === 2, {
        message: "Coordinates must be [longitude, latitude]",
      }),
  });

export const updateDriverProfileZodSchema = z.object({
  name: z.string().optional(),
  vehicle: z
    .object({
      vehicleNumber: z.string().min(4).optional(),
      vehicleType: z.enum(Object.values(VehicleType) as [string]).optional(),
    })
    .optional(),
  drivingLicense: z.string().optional(),
});


export const updateDriverStatusZodSchema = z.object({
  driverStatus: z.enum(Object.values(DriverStatus) as [string], {
    message: "Driver status is required or invalid",
  }),
});