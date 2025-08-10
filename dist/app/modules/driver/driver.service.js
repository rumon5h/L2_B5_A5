"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.driverServices = exports.updateDriverStatus = void 0;
const appErrors_1 = __importDefault(require("../../errorHelpers/appErrors"));
const driver_interface_1 = require("./driver.interface");
const driver_model_1 = require("./driver.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const user_model_1 = require("../user/user.model");
const user_interface_1 = require("../user/user.interface");
const createDriver = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(payload.userId);
    if (!user) {
        throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "User not found!");
    }
    if (user.isBlocked === user_interface_1.IsBlocked.BLOCKED) {
        throw new appErrors_1.default(http_status_codes_1.default.FORBIDDEN, "Your account is blocked. Contact support.");
    }
    if (!user.isVerified) {
        throw new appErrors_1.default(http_status_codes_1.default.FORBIDDEN, "Your account is not Verified. Contact support.");
    }
    if (!user.phone) {
        throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "Please update your phone number in user profile before applying.");
    }
    if (!user.location || !user.location.coordinates || user.location.coordinates.length !== 2) {
        throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "Please update your location In User Profile before applying.");
    }
    const existingDriver = yield driver_model_1.Driver.findOne({ userId: payload.userId });
    if (existingDriver) {
        if (existingDriver.driverStatus === driver_interface_1.DriverStatus.PENDING) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "Please wait for admin approval!");
        }
        if (existingDriver.driverStatus === driver_interface_1.DriverStatus.SUSPENDED) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "You are suspended. Please contact the office!");
        }
        throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "Driver profile already exists.");
    }
    const driver = yield driver_model_1.Driver.create(payload);
    return driver;
});
const updateDriverStatus = (id, driverStatus) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield driver_model_1.Driver.startSession();
    session.startTransaction();
    try {
        const driver = yield driver_model_1.Driver.findById(id).session(session);
        if (!driver) {
            throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "Driver not found");
        }
        if (driver.driverStatus === driver_interface_1.DriverStatus.APPROVED && driverStatus === driver_interface_1.DriverStatus.APPROVED) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "Driver is already approved");
        }
        driver.driverStatus = driverStatus;
        yield driver.save({ session });
        if (driverStatus === driver_interface_1.DriverStatus.APPROVED) {
            yield user_model_1.User.findByIdAndUpdate(driver.userId, { role: user_interface_1.Role.DRIVER }, { session });
        }
        yield session.commitTransaction();
        session.endSession();
        return driver;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
exports.updateDriverStatus = updateDriverStatus;
const getMe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const driver = yield driver_model_1.Driver.findOne({ userId });
    // console.log(driver)
    return {
        data: driver
    };
});
const updateMyDriverProfile = (userId, updatedData) => __awaiter(void 0, void 0, void 0, function* () {
    const driver = yield driver_model_1.Driver.findOne({ userId });
    if (!driver) {
        throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "Driver not found");
    }
    const updatedDriver = yield driver_model_1.Driver.findOneAndUpdate({ userId: userId }, updatedData, { new: true, runValidators: true });
    return {
        data: updatedDriver
    };
});
const getAllDrivers = () => __awaiter(void 0, void 0, void 0, function* () {
    const drivers = yield driver_model_1.Driver.find({});
    return {
        data: drivers,
    };
});
const getSingleDriver = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const driver = yield driver_model_1.Driver.findById(id).populate({
        path: "userId",
        select: "-password -auths"
    });
    if (!driver) {
        throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "Driver not found");
    }
    return {
        data: driver
    };
});
const goOnline = (userId, currentLocation) => __awaiter(void 0, void 0, void 0, function* () {
    const driverInfo = yield driver_model_1.Driver.findOne({ userId });
    if (!driverInfo) {
        throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "Driver not found");
    }
    const driver = yield driver_model_1.Driver.findOneAndUpdate({ userId }, {
        onlineStatus: "ONLINE",
        currentLocation: currentLocation,
    }, { new: true });
    return { data: driver };
});
const goOffline = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const driverInfo = yield driver_model_1.Driver.findOne({ userId });
    if (!driverInfo) {
        throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "Driver not found");
    }
    const driver = yield driver_model_1.Driver.findOneAndUpdate({ userId }, {
        onlineStatus: "OFFLINE",
        currentLocation: {
            type: "Point",
            coordinates: [],
        },
    }, { new: true });
    return { data: driver };
});
exports.driverServices = {
    createDriver,
    updateDriverStatus: exports.updateDriverStatus,
    getMe,
    updateMyDriverProfile,
    getAllDrivers,
    getSingleDriver,
    goOffline,
    goOnline
};
