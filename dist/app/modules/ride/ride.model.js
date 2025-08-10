"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ride = void 0;
const mongoose_1 = require("mongoose");
const ride_interface_1 = require("./ride.interface");
const rideSchema = new mongoose_1.Schema({
    riderId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    driverId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Driver" },
    pickupLocation: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number, Number],
            required: true,
        },
    },
    destination: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number, Number],
            required: true,
        },
    },
    travelDistance: {
        type: Number,
    },
    fare: {
        type: Number,
    },
    rideStatus: {
        type: String,
        enum: Object.values(ride_interface_1.RideStatus),
        default: ride_interface_1.RideStatus.REQUESTED,
    },
    timestamps: {
        requestedAt: {
            type: Date,
            default: Date.now,
        },
        acceptedAt: Date,
        pickedUpAt: Date,
        startedAt: Date,
        completedAt: Date,
        cancelledAt: Date,
    },
    cancelledBy: {
        type: String,
        enum: Object.values(ride_interface_1.CancelledBy),
    },
    rejectedBy: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
            default: [],
        },
    ],
    feedback: {
        type: String
    },
    rating: { type: Number }
}, {
    versionKey: false,
    timestamps: true
});
exports.Ride = (0, mongoose_1.model)("Ride", rideSchema);
