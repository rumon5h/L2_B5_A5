import { Schema, model } from "mongoose";
import { CancelledBy, IRide, RideStatus } from "./ride.interface";

const rideSchema = new Schema<IRide>(
  {
    riderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    driverId: { type: Schema.Types.ObjectId, ref: "Driver" },
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
      enum: Object.values(RideStatus),
      default: RideStatus.REQUESTED,
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
      enum: Object.values(CancelledBy),
    },
    rejectedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    feedback : {
      type : String
    },
    rating: { type: Number }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

export const Ride = model<IRide>("Ride", rideSchema);