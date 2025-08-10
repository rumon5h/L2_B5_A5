"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Driver = void 0;
const mongoose_1 = require("mongoose");
const driver_interface_1 = require("./driver.interface");
const driverSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    vehicle: {
        vehicleNumber: { type: String, required: true },
        vehicleType: {
            type: String,
            enum: Object.values(driver_interface_1.VehicleType),
            required: true,
        },
    },
    onlineStatus: {
        type: String,
        enum: Object.values(driver_interface_1.DriverOnlineStatus),
        default: driver_interface_1.DriverOnlineStatus.OFFLINE
    },
    ridingStatus: {
        type: String,
        enum: Object.values(driver_interface_1.DriverRidingStatus),
        default: driver_interface_1.DriverRidingStatus.IDLE,
    },
    currentLocation: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
            required: false
        },
        coordinates: {
            type: [Number],
            required: false
        }
    },
    totalEarning: {
        type: Number,
        default: 0,
    },
    totalRides: {
        type: Number,
        default: 0,
    },
    rejectedRides: {
        type: Number,
        default: 0,
    },
    drivingLicense: {
        type: String,
        required: true,
    },
    driverStatus: {
        type: String,
        enum: Object.values(driver_interface_1.DriverStatus),
        default: driver_interface_1.DriverStatus.PENDING,
    },
    rating: { type: Number, default: 0 },
}, {
    versionKey: false,
    timestamps: true,
});
exports.Driver = (0, mongoose_1.model)("Driver", driverSchema);
