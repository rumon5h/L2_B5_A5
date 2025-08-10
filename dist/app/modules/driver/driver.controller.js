"use strict";
/* eslint-disable @typescript-eslint/no-unused-vars */
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
exports.driverControllers = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const sendResponse_1 = require("../../utils/sendResponse");
const catchAsync_1 = require("../../utils/catchAsync");
const driver_service_1 = require("./driver.service");
const createDriver = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const user = req.user;
    const userId = user.userId;
    const payload = Object.assign(Object.assign({}, req.body), { userId, drivingLicense: (_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.file) === null || _b === void 0 ? void 0 : _b.path });
    const driver = yield driver_service_1.driverServices.createDriver(payload);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Driver Created Successfully",
        data: driver
    });
}));
const updateDriverStatus = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { driverStatus } = req.body;
    const result = yield driver_service_1.driverServices.updateDriverStatus(id, driverStatus);
    res.status(http_status_codes_1.default.OK).json({
        success: true,
        message: `Driver status updated to ${driverStatus}`,
        data: result,
    });
}));
const getMe = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedToken = req.user;
    const result = yield driver_service_1.driverServices.getMe(decodedToken.userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Your Driver Profile Retrieved Successfully",
        data: result.data
    });
}));
const updateMyDriverProfile = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const user = req.user;
    const userId = user.userId;
    const updateData = Object.assign({}, req.body);
    if ((_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.file) === null || _b === void 0 ? void 0 : _b.path) {
        updateData.drivingLicense = req.body.file.path;
    }
    const updatedDriver = yield driver_service_1.driverServices.updateMyDriverProfile(userId, updateData);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Driver profile updated successfully",
        data: updatedDriver,
    });
}));
const getAllDrivers = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield driver_service_1.driverServices.getAllDrivers();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "All Driver Retrieved Successfully",
        data: result.data
    });
}));
const getSingleDriver = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield driver_service_1.driverServices.getSingleDriver(id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Driver Retrieved Successfully",
        data: result.data
    });
}));
const goOnline = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const userId = user.userId;
    const currentLocation = req.body;
    const result = yield driver_service_1.driverServices.goOnline(userId, currentLocation);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "You are Online Now!",
        data: result.data
    });
}));
const goOffline = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const userId = user.userId;
    const result = yield driver_service_1.driverServices.goOffline(userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "You Have Became Offline Now!",
        data: result.data
    });
}));
exports.driverControllers = {
    createDriver,
    updateDriverStatus,
    getMe,
    updateMyDriverProfile,
    getSingleDriver,
    getAllDrivers,
    goOffline,
    goOnline
};
