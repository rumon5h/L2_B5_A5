"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const user_interface_1 = require("./user.interface");
const authProviderSchema = new mongoose_1.Schema({
    provider: { type: String, required: true },
    providerId: { type: String, required: true }
}, {
    versionKey: false,
    _id: false
});
const userSchema = new mongoose_1.Schema({
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
        type: String,
        enum: Object.values(user_interface_1.Role),
        default: user_interface_1.Role.RIDER
    },
    phone: { type: String },
    picture: { type: String },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number, Number],
        },
    },
    isBlocked: {
        type: String,
        enum: Object.values(user_interface_1.IsBlocked),
        default: user_interface_1.IsBlocked.UNBLOCKED
    },
    riderStatus: {
        type: String,
        enum: Object.values(user_interface_1.RiderStatus),
        default: user_interface_1.RiderStatus.IDLE
    },
    isVerified: { type: Boolean, default: true },
    auths: [authProviderSchema]
}, {
    versionKey: false,
    timestamps: true
});
exports.User = (0, mongoose_1.model)("User", userSchema);
