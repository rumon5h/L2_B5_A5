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
exports.StatsService = void 0;
const ride_model_1 = require("../ride/ride.model");
const ride_interface_1 = require("../ride/ride.interface");
const user_model_1 = require("../user/user.model");
const user_interface_1 = require("../user/user.interface");
const mongoose_1 = __importDefault(require("mongoose"));
const driver_model_1 = require("../driver/driver.model");
const appErrors_1 = __importDefault(require("../../errorHelpers/appErrors"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const getRideStats = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const totalRidesPromise = ride_model_1.Ride.countDocuments();
    const ridesByStatusPromise = ride_model_1.Ride.aggregate([
        {
            $group: {
                _id: "$rideStatus",
                count: { $sum: 1 }
            }
        }
    ]);
    const totalRevenuePromise = ride_model_1.Ride.aggregate([
        {
            $match: {
                rideStatus: ride_interface_1.RideStatus.COMPLETED
            }
        },
        {
            $group: {
                _id: null,
                totalFare: { $sum: "$fare" }
            }
        }
    ]);
    const avgFarePromise = ride_model_1.Ride.aggregate([
        {
            $match: {
                rideStatus: ride_interface_1.RideStatus.COMPLETED
            }
        },
        {
            $group: {
                _id: null,
                avgFare: { $avg: "$fare" }
            }
        }
    ]);
    const totalRidersPromise = user_model_1.User.countDocuments({ role: user_interface_1.Role.RIDER });
    const totalDriversPromise = user_model_1.User.countDocuments({ role: user_interface_1.Role.DRIVER });
    const [totalRides, ridesByStatus, totalRevenue, avgFare, totalRiders, totalDrivers] = yield Promise.all([
        totalRidesPromise,
        ridesByStatusPromise,
        totalRevenuePromise,
        avgFarePromise,
        totalRidersPromise,
        totalDriversPromise
    ]);
    return {
        totalRides,
        ridesByStatus,
        totalRevenue: ((_a = totalRevenue === null || totalRevenue === void 0 ? void 0 : totalRevenue[0]) === null || _a === void 0 ? void 0 : _a.totalFare) || 0,
        avgFare: ((_b = avgFare === null || avgFare === void 0 ? void 0 : avgFare[0]) === null || _b === void 0 ? void 0 : _b.avgFare) || 0,
        totalRiders,
        totalDrivers
    };
});
const getDriverStats = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const driver = yield driver_model_1.Driver.findOne({ userId });
    if (!driver) {
        throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "Driver Not Found");
    }
    const driverId = driver._id;
    const totalCompletedRidesPromise = ride_model_1.Ride.countDocuments({
        driverId: new mongoose_1.default.Types.ObjectId(driverId),
        rideStatus: ride_interface_1.RideStatus.COMPLETED,
    });
    const totalCancelledRidesPromise = ride_model_1.Ride.countDocuments({
        driverId: new mongoose_1.default.Types.ObjectId(driverId),
        rideStatus: ride_interface_1.RideStatus.CANCELLED,
    });
    const totalEarningsPromise = ride_model_1.Ride.aggregate([
        {
            $match: {
                driverId: new mongoose_1.default.Types.ObjectId(driverId),
                rideStatus: ride_interface_1.RideStatus.COMPLETED,
            },
        },
        {
            $group: {
                _id: null,
                totalFare: { $sum: "$fare" },
            },
        },
    ]);
    const [totalCompletedRides, totalCancelledRides, totalEarningsAgg,] = yield Promise.all([
        totalCompletedRidesPromise,
        totalCancelledRidesPromise,
        totalEarningsPromise,
    ]);
    return {
        totalCompletedRides,
        totalCancelledRides,
        totalEarnings: ((_a = totalEarningsAgg === null || totalEarningsAgg === void 0 ? void 0 : totalEarningsAgg[0]) === null || _a === void 0 ? void 0 : _a.totalFare) || 0,
    };
});
exports.StatsService = {
    getRideStats,
    getDriverStats
};
