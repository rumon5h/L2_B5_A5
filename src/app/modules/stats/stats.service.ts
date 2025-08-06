import { Ride } from "../ride/ride.model";
import { RideStatus } from "../ride/ride.interface";
import { User } from "../user/user.model";
import { Role } from "../user/user.interface";
import mongoose from "mongoose";
import { Driver } from "../driver/driver.model";
import AppError from "../../errorHelpers/appErrors";
import httpStatus from 'http-status-codes';

const getRideStats = async () => {
    const totalRidesPromise = Ride.countDocuments();

    const ridesByStatusPromise = Ride.aggregate([
        {
            $group: {
                _id: "$rideStatus",
                count: { $sum: 1 }
            }
        }
    ]);

    const totalRevenuePromise = Ride.aggregate([
        {
            $match: {
                rideStatus: RideStatus.COMPLETED
            }
        },
        {
            $group: {
                _id: null,
                totalFare: { $sum: "$fare" }
            }
        }
    ]);

    const avgFarePromise = Ride.aggregate([
        {
            $match: {
                rideStatus: RideStatus.COMPLETED
            }
        },
        {
            $group: {
                _id: null,
                avgFare: { $avg: "$fare" }
            }
        }
    ]);

    const totalRidersPromise = User.countDocuments({ role: Role.RIDER });
    const totalDriversPromise = User.countDocuments({ role: Role.DRIVER });

    const [
        totalRides,
        ridesByStatus,
        totalRevenue,
        avgFare,
        totalRiders,
        totalDrivers
    ] = await Promise.all([
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
        totalRevenue: totalRevenue?.[0]?.totalFare || 0,
        avgFare: avgFare?.[0]?.avgFare || 0,
        totalRiders,
        totalDrivers
    };
};


const getDriverStats = async (userId: string) => {
    const driver = await Driver.findOne({ userId })

    if (!driver) {
        throw new AppError(httpStatus.NOT_FOUND, "Driver Not Found")
    }
    const driverId = driver._id


    const totalCompletedRidesPromise = Ride.countDocuments({
        driverId: new mongoose.Types.ObjectId(driverId),
        rideStatus: RideStatus.COMPLETED,
    });

    const totalCancelledRidesPromise = Ride.countDocuments({
        driverId: new mongoose.Types.ObjectId(driverId),
        rideStatus: RideStatus.CANCELLED,
    });

    const totalEarningsPromise = Ride.aggregate([
        {
            $match: {
                driverId: new mongoose.Types.ObjectId(driverId),
                rideStatus: RideStatus.COMPLETED,
            },
        },
        {
            $group: {
                _id: null,
                totalFare: { $sum: "$fare" },
            },
        },
    ]);

    const [
        totalCompletedRides,
        totalCancelledRides,
        totalEarningsAgg,
    ] = await Promise.all([
        totalCompletedRidesPromise,
        totalCancelledRidesPromise,
        totalEarningsPromise,
    ]);

    return {
        totalCompletedRides,
        totalCancelledRides,
        totalEarnings: totalEarningsAgg?.[0]?.totalFare || 0,
    };
};


export const StatsService = {
    getRideStats,
    getDriverStats
};