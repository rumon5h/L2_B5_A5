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
exports.rideController = void 0;
const ride_service_1 = require("./ride.service");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const ride_interface_1 = require("./ride.interface");
const createRide = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const userId = user.userId;
    const payload = Object.assign(Object.assign({}, req.body), { riderId: userId, rideStatus: ride_interface_1.RideStatus.REQUESTED, timestamps: {
            requestedAt: new Date(),
        } });
    const result = yield ride_service_1.rideService.createRide(payload);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Ride requested successfully",
        data: result.data,
    });
}));
const getRidesNearMe = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const userId = user.userId;
    const result = yield ride_service_1.rideService.getRidesNearMe(userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Ride Retrieved successfully",
        data: result.data,
    });
}));
const acceptRide = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driver = req.user;
    const driverId = driver.userId;
    const rideId = req.params.id;
    const acceptedRide = yield ride_service_1.rideService.acceptRide(driverId, rideId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Ride Accepted successfully",
        data: acceptedRide.data
    });
}));
const rejectRide = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driver = req.user;
    const driverId = driver.userId;
    const rideId = req.params.id;
    const acceptedRide = yield ride_service_1.rideService.rejectRide(driverId, rideId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Ride Rejected successfully",
        data: acceptedRide.data
    });
}));
const pickupRider = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driver = req.user;
    const driverId = driver.userId;
    const rideId = req.params.id;
    const pickedUpRider = yield ride_service_1.rideService.pickupRider(driverId, rideId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Rider PickedUp successfully",
        data: pickedUpRider.data
    });
}));
const startRide = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driver = req.user;
    const driverId = driver.userId;
    const rideId = req.params.id;
    const rideInfo = yield ride_service_1.rideService.startRide(driverId, rideId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Ride Has Been Started !",
        data: rideInfo.data
    });
}));
const completeRide = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const driver = req.user;
    const driverId = driver.userId;
    const rideId = req.params.id;
    const rideInfo = yield ride_service_1.rideService.completeRide(driverId, rideId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Ride Has Been Completed !",
        data: rideInfo.data
    });
}));
const getAllRidesForAdmin = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const rideInfo = yield ride_service_1.rideService.getAllRidesForAdmin();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "All Rides Retrieved For Admin !",
        data: rideInfo.allRides
    });
}));
const getAllRidesForRider = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const rider = req.user;
    const riderId = rider.userId;
    const rideInfo = yield ride_service_1.rideService.getAllRidesForRider(riderId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Rides Made By You are Retrieved!",
        data: rideInfo.data
    });
}));
const getAllRidesForDriver = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const userId = user.userId;
    const rideInfo = yield ride_service_1.rideService.getAllRidesForDriver(userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Rides Made By You are Retrieved!",
        data: rideInfo.data
    });
}));
const getSingleRideForRider = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const rideId = req.params.id;
    const riderInfo = req.user;
    const riderId = riderInfo.userId;
    const result = yield ride_service_1.rideService.getSingleRideForRider(rideId, riderId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Your Ride Information Retrieved!",
        data: result.data
    });
}));
const getDriversNearMe = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const userId = user.userId;
    const result = yield ride_service_1.rideService.getDriversNearMe(userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: result.count === 0
            ? "Please wait. For now, there is no driver available near you."
            : "Available Drivers Retrieved Successfully!",
        data: result.data,
    });
}));
const cancelRideByRider = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const userId = user.userId;
    const rideId = req.params.id;
    const result = yield ride_service_1.rideService.cancelRideByRider(userId, rideId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Your Ride Has Been Cancelled!",
        data: result.data,
    });
}));
const giveFeedback = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { rideId } = req.params;
    const { feedback, rating } = req.body;
    const user = req.user;
    const userId = user.userId;
    const result = yield ride_service_1.rideService.giveFeedbackAndRateDriver(rideId, userId, feedback, rating);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Feedback submitted successfully",
        data: result,
    });
}));
exports.rideController = {
    createRide,
    getRidesNearMe,
    acceptRide,
    pickupRider,
    startRide,
    completeRide,
    getAllRidesForAdmin,
    getAllRidesForRider,
    getAllRidesForDriver,
    getSingleRideForRider,
    getDriversNearMe,
    rejectRide,
    cancelRideByRider,
    giveFeedback
};
