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
exports.rideService = exports.giveFeedbackAndRateDriver = void 0;
const ride_model_1 = require("./ride.model");
const ride_interface_1 = require("./ride.interface");
const calculateDistanceAndFare_1 = require("../../utils/calculateDistanceAndFare");
const user_interface_1 = require("../user/user.interface");
const user_model_1 = require("../user/user.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const appErrors_1 = __importDefault(require("../../errorHelpers/appErrors"));
const driver_model_1 = require("../driver/driver.model");
const driver_interface_1 = require("../driver/driver.interface");
const haversine_distance_1 = __importDefault(require("haversine-distance"));
const createRide = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { pickupLocation, destination } = payload;
    const session = yield ride_model_1.Ride.startSession();
    session.startTransaction();
    try {
        const rider = yield user_model_1.User.findById(payload.riderId).session(session);
        if (!rider) {
            throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "Rider not found.");
        }
        if (rider.isBlocked === user_interface_1.IsBlocked.BLOCKED) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "You are blocked. Contact admin.");
        }
        if (rider.riderStatus === user_interface_1.RiderStatus.REQUESTED || rider.riderStatus === user_interface_1.RiderStatus.ON_RIDE) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, `You already have a ride in ${rider.riderStatus} State.`);
        }
        const { distanceKm, fare } = (0, calculateDistanceAndFare_1.calculateDistanceAndFare)(pickupLocation.coordinates, destination.coordinates);
        const ride = yield ride_model_1.Ride.create([Object.assign(Object.assign({}, payload), { travelDistance: distanceKm, fare })], { session });
        yield user_model_1.User.findByIdAndUpdate(payload.riderId, { riderStatus: user_interface_1.RiderStatus.REQUESTED }, { session });
        yield session.commitTransaction();
        session.endSession();
        return { data: ride[0] };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const getRidesNearMe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "User not found.");
    }
    if (user && user.isBlocked === user_interface_1.IsBlocked.BLOCKED) {
        throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "You are blocked. Contact Admin.");
    }
    const driver = yield driver_model_1.Driver.findOne({ userId });
    if (!driver) {
        throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "Driver not found.");
    }
    if (driver.driverStatus !== driver_interface_1.DriverStatus.APPROVED) {
        throw new appErrors_1.default(http_status_codes_1.default.FORBIDDEN, `Driver is not approved to accept rides. Your status is currently: ${driver.driverStatus}`);
    }
    if (driver.onlineStatus === driver_interface_1.DriverOnlineStatus.OFFLINE) {
        throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "Go Online To See The Rides Around You!");
    }
    if (!driver.currentLocation || !driver.currentLocation.coordinates) {
        throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "Driver location is not set.");
    }
    const requestedRides = yield ride_model_1.Ride.find({
        rideStatus: ride_interface_1.RideStatus.REQUESTED,
    });
    const nearByRides = requestedRides.filter((ride) => {
        var _a, _b, _c;
        if ((_a = ride.rejectedBy) === null || _a === void 0 ? void 0 : _a.some(id => id.toString() === driver._id.toString())) {
            return false;
        }
        if (!((_b = ride.pickupLocation) === null || _b === void 0 ? void 0 : _b.coordinates) || !((_c = driver.currentLocation) === null || _c === void 0 ? void 0 : _c.coordinates))
            return false;
        const [pickupLng, pickupLat] = ride.pickupLocation.coordinates;
        const [driverLng, driverLat] = driver.currentLocation.coordinates;
        const distanceInMeters = (0, haversine_distance_1.default)({ lat: driverLat, lon: driverLng }, { lat: pickupLat, lon: pickupLng });
        return distanceInMeters <= 1000;
    });
    return {
        success: true,
        data: nearByRides,
    };
});
const acceptRide = (driverUserId, rideId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const session = yield ride_model_1.Ride.startSession();
    session.startTransaction();
    try {
        const driver = yield driver_model_1.Driver.findOne({ userId: driverUserId }).session(session);
        if (!driver) {
            throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "Driver not found.");
        }
        if (driver.driverStatus === driver_interface_1.DriverStatus.SUSPENDED) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "You are suspended. Cannot accept rides.");
        }
        if (driver.onlineStatus === driver_interface_1.DriverOnlineStatus.OFFLINE) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "First go Online Then Try To Accept!");
        }
        if (driver.ridingStatus !== driver_interface_1.DriverRidingStatus.IDLE) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "You can Not Accept another Ride While Engaged In a Trip Already");
        }
        const ride = yield ride_model_1.Ride.findById(rideId).session(session);
        if (!ride) {
            throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "Ride not found.");
        }
        if (ride.rideStatus !== ride_interface_1.RideStatus.REQUESTED) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, `Ride is Already ${ride.rideStatus}`);
        }
        if ((_a = ride.rejectedBy) === null || _a === void 0 ? void 0 : _a.some((id) => id.toString() === driver._id.toString())) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "You have already rejected this ride.");
        }
        if (String(driver.userId) === String(ride.riderId)) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "You cannot accept your own ride.");
        }
        const rider = yield user_model_1.User.findById(ride.riderId).session(session);
        if (!rider) {
            throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "Rider not found.");
        }
        ride.driverId = driver._id;
        ride.rideStatus = ride_interface_1.RideStatus.ACCEPTED;
        ride.timestamps = Object.assign(Object.assign({}, ride.timestamps), { acceptedAt: new Date() });
        yield ride.save({ session });
        driver.ridingStatus = driver_interface_1.DriverRidingStatus.ACCEPTED;
        yield driver.save({ session });
        rider.riderStatus = user_interface_1.RiderStatus.WAITING;
        yield rider.save({ session });
        const data = {
            rideId: ride._id,
            riderName: rider.name,
            riderPhone: rider.phone
        };
        yield session.commitTransaction();
        session.endSession();
        return {
            data: data
        };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const rejectRide = (driverUserId, rideId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield ride_model_1.Ride.startSession();
    session.startTransaction();
    try {
        const driver = yield driver_model_1.Driver.findOne({ userId: driverUserId }).session(session);
        if (!driver) {
            throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "Driver not found.");
        }
        if (driver.driverStatus === driver_interface_1.DriverStatus.SUSPENDED) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "You are suspended. Cannot accept or reject rides.");
        }
        if (driver.onlineStatus === driver_interface_1.DriverOnlineStatus.OFFLINE) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "First go online, then try to accept or reject!");
        }
        if (driver.ridingStatus !== driver_interface_1.DriverRidingStatus.IDLE) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "You cannot accept or reject another ride while already in a trip.");
        }
        const ride = yield ride_model_1.Ride.findById(rideId).session(session);
        if (!ride) {
            throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "Ride not found.");
        }
        if (ride.rideStatus !== ride_interface_1.RideStatus.REQUESTED) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, `Ride is already ${ride.rideStatus}.`);
        }
        if (String(driver.userId) === String(ride.riderId)) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "You cannot reject your own ride.");
        }
        const rider = yield user_model_1.User.findById(ride.riderId).session(session);
        if (!rider) {
            throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "Rider not found.");
        }
        if (!ride.rejectedBy.includes(driver._id)) {
            ride.rejectedBy.push(driver._id);
        }
        yield ride.save({ session });
        driver.rejectedRides += 1;
        yield driver.save({ session });
        const data = {
            riderName: rider.name,
            riderPhone: rider.phone
        };
        yield session.commitTransaction();
        session.endSession();
        return { data };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const pickupRider = (driverUserId, rideId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield ride_model_1.Ride.startSession();
    session.startTransaction();
    try {
        const driver = yield driver_model_1.Driver.findOne({ userId: driverUserId }).session(session);
        if (!driver) {
            throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "Driver not found.");
        }
        if (driver.driverStatus === driver_interface_1.DriverStatus.SUSPENDED) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "You are suspended. Cannot complete.");
        }
        if (driver.onlineStatus === driver_interface_1.DriverOnlineStatus.OFFLINE) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "Go Online To Pickup The Rider!");
        }
        const ride = yield ride_model_1.Ride.findById(rideId).session(session);
        if (!ride) {
            throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "Ride not found.");
        }
        if (!ride.driverId) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "You Have Not Accepted This Ride Yet! Accept First!");
        }
        if (String(driver._id) !== String(ride.driverId)) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "You cannot pick up another driver's rider!");
        }
        if ([ride_interface_1.RideStatus.PICKED_UP, ride_interface_1.RideStatus.IN_TRANSIT, ride_interface_1.RideStatus.COMPLETED].includes(ride.rideStatus)) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, `This ride is already in ${ride.rideStatus} State.`);
        }
        if (ride.rideStatus === ride_interface_1.RideStatus.CANCELLED) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "This ride was cancelled.");
        }
        if (ride.rideStatus !== ride_interface_1.RideStatus.ACCEPTED) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "You must accept the ride first.");
        }
        if (String(driver.userId) === String(ride.riderId)) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "You cannot pick up your own ride.");
        }
        const rider = yield user_model_1.User.findById(ride.riderId).session(session);
        if (!rider) {
            throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "Rider not found.");
        }
        ride.rideStatus = ride_interface_1.RideStatus.PICKED_UP;
        ride.timestamps = Object.assign(Object.assign({}, ride.timestamps), { pickedUpAt: new Date() });
        yield ride.save({ session });
        driver.ridingStatus = driver_interface_1.DriverRidingStatus.RIDING;
        yield driver.save({ session });
        rider.riderStatus = user_interface_1.RiderStatus.PICKED_UP;
        yield rider.save({ session });
        yield session.commitTransaction();
        session.endSession();
        return {
            data: {
                rideId: ride._id,
                riderDestination: ride.destination,
                totalFare: ride.fare,
            },
        };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const startRide = (driverUserId, rideId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield ride_model_1.Ride.startSession();
    session.startTransaction();
    try {
        const driver = yield driver_model_1.Driver.findOne({ userId: driverUserId }).session(session);
        if (!driver) {
            throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "Driver not found.");
        }
        if (driver.driverStatus === driver_interface_1.DriverStatus.SUSPENDED) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "You are suspended. Cannot complete.");
        }
        if (driver.onlineStatus === driver_interface_1.DriverOnlineStatus.OFFLINE) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "Go Online To start The Ride!");
        }
        const ride = yield ride_model_1.Ride.findById(rideId).session(session);
        if (!ride) {
            throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "Ride not found.");
        }
        if (!ride.driverId) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "You Have Not Accepted This Ride Yet! Accept First!");
        }
        if (String(driver._id) !== String(ride.driverId)) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "You cannot Start Riding with another driver's rider!");
        }
        if (ride.rideStatus === ride_interface_1.RideStatus.CANCELLED) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "This ride was cancelled.");
        }
        if ([ride_interface_1.RideStatus.IN_TRANSIT, ride_interface_1.RideStatus.COMPLETED].includes(ride.rideStatus)) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, `This ride is already in ${ride.rideStatus} State.`);
        }
        if (ride.rideStatus !== ride_interface_1.RideStatus.PICKED_UP) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "You must Pickup Rider To Start The Ride.");
        }
        if (String(driver.userId) === String(ride.riderId)) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "You cannot Run your ride with Your Owns.");
        }
        const rider = yield user_model_1.User.findById(ride.riderId).session(session);
        if (!rider) {
            throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "Rider not found.");
        }
        ride.rideStatus = ride_interface_1.RideStatus.IN_TRANSIT;
        ride.timestamps = Object.assign(Object.assign({}, ride.timestamps), { startedAt: new Date() });
        yield ride.save({ session });
        driver.ridingStatus = driver_interface_1.DriverRidingStatus.RIDING;
        yield driver.save({ session });
        rider.riderStatus = user_interface_1.RiderStatus.ON_RIDE;
        yield rider.save({ session });
        yield session.commitTransaction();
        session.endSession();
        return {
            data: {
                rideId: ride._id,
                riderDestination: ride.destination,
                totalFare: ride.fare,
            },
        };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const completeRide = (driverUserId, rideId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield ride_model_1.Ride.startSession();
    session.startTransaction();
    try {
        const driver = yield driver_model_1.Driver.findOne({ userId: driverUserId }).session(session);
        if (!driver) {
            throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "Driver not found.");
        }
        if (driver.driverStatus === driver_interface_1.DriverStatus.SUSPENDED) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "You are suspended. Cannot complete.");
        }
        if (driver.onlineStatus === driver_interface_1.DriverOnlineStatus.OFFLINE) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "Go Online To Pickup The Rider!");
        }
        const ride = yield ride_model_1.Ride.findById(rideId).session(session);
        if (!ride) {
            throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "Ride not found.");
        }
        if (!ride.driverId) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "You Have Not Accepted This Ride Yet! Accept First!");
        }
        if (String(driver._id) !== String(ride.driverId)) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "You cannot Start Riding with another driver's rider!");
        }
        if (ride.rideStatus === ride_interface_1.RideStatus.CANCELLED) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "This ride was cancelled.");
        }
        if ([ride_interface_1.RideStatus.COMPLETED].includes(ride.rideStatus)) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, `This ride is already in ${ride.rideStatus} State.`);
        }
        if (ride.rideStatus !== ride_interface_1.RideStatus.IN_TRANSIT) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "You must Start Ride To Finish The Ride!.");
        }
        if (String(driver.userId) === String(ride.riderId)) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "You cannot Run your ride with Your Owns.");
        }
        const rider = yield user_model_1.User.findById(ride.riderId).session(session);
        if (!rider) {
            throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "Rider not found.");
        }
        ride.rideStatus = ride_interface_1.RideStatus.COMPLETED;
        ride.timestamps = Object.assign(Object.assign({}, ride.timestamps), { completedAt: new Date() });
        yield ride.save({ session });
        driver.ridingStatus = driver_interface_1.DriverRidingStatus.IDLE;
        driver.totalEarning = Number(driver.totalEarning || 0) + Number(ride.fare || 0);
        driver.totalRides = Number(driver.totalRides || 0) + 1;
        driver.currentLocation = ride.destination;
        yield driver.save({ session });
        rider.riderStatus = user_interface_1.RiderStatus.IDLE;
        yield rider.save({ session });
        yield session.commitTransaction();
        session.endSession();
        return {
            data: {
                rideId: ride._id,
                totalIncome: ride.fare,
            },
        };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const getAllRidesForAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    const allRides = yield ride_model_1.Ride.find({});
    return {
        allRides
    };
});
const getAllRidesForRider = (riderId) => __awaiter(void 0, void 0, void 0, function* () {
    const myRides = yield ride_model_1.Ride.find({ riderId: { $eq: riderId } });
    const myRideCounts = yield ride_model_1.Ride.countDocuments();
    const data = {
        myRideCounts,
        myRides
    };
    return {
        data
    };
});
const getAllRidesForDriver = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const driver = yield driver_model_1.Driver.findOne({ userId });
    if (!driver) {
        throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "Driver InFormation Not Found !");
    }
    const driverId = driver._id;
    const allRides = yield ride_model_1.Ride.find({ driverId: { $eq: driverId } });
    const myRideCounts = allRides.length;
    const data = {
        myRideCounts,
        allRides
    };
    return {
        data
    };
});
const getSingleRideForRider = (rideId, riderId) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield ride_model_1.Ride.findById(rideId);
    if (!data) {
        throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "Ride Information Not Found");
    }
    if (String(data.riderId) !== riderId) {
        throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "This Ride Is Not Yours!");
    }
    return {
        data
    };
});
const getDriversNearMe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "User not found.");
    }
    if (user.isBlocked === user_interface_1.IsBlocked.BLOCKED) {
        throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "You are blocked. Contact Admin.");
    }
    const latestRide = yield ride_model_1.Ride.findOne({ riderId: userId }).sort({ createdAt: -1 });
    if (!latestRide || !((_b = (_a = latestRide.pickupLocation) === null || _a === void 0 ? void 0 : _a.coordinates) === null || _b === void 0 ? void 0 : _b.length)) {
        throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "Your location not found.");
    }
    const [pickupLng, pickupLat] = latestRide.pickupLocation.coordinates;
    const drivers = yield driver_model_1.Driver.find({
        driverStatus: driver_interface_1.DriverStatus.APPROVED,
        onlineStatus: driver_interface_1.DriverOnlineStatus.ONLINE,
        ridingStatus: { $ne: driver_interface_1.DriverRidingStatus.RIDING },
        currentLocation: { $exists: true, $ne: null },
    }, {
        vehicle: 1,
        currentLocation: 1,
    }).populate("userId", "name phone");
    const nearbyDrivers = drivers.filter((driver) => {
        var _a, _b;
        if (!((_b = (_a = driver.currentLocation) === null || _a === void 0 ? void 0 : _a.coordinates) === null || _b === void 0 ? void 0 : _b.length))
            return false;
        const [driverLng, driverLat] = driver.currentLocation.coordinates;
        const distanceInMeters = (0, haversine_distance_1.default)({ lat: pickupLat, lon: pickupLng }, { lat: driverLat, lon: driverLng });
        return distanceInMeters <= 1000;
    });
    return {
        success: true,
        count: nearbyDrivers.length,
        data: nearbyDrivers,
    };
});
const cancelRideByRider = (userId, rideId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield ride_model_1.Ride.startSession();
    session.startTransaction();
    try {
        const user = yield user_model_1.User.findById(userId).session(session);
        if (!user) {
            throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "User not found.");
        }
        const ride = yield ride_model_1.Ride.findById(rideId).session(session);
        if (!ride) {
            throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "Ride not found.");
        }
        if (String(ride.riderId) !== String(userId)) {
            throw new appErrors_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized to cancel this ride.");
        }
        if ([
            ride_interface_1.RideStatus.ACCEPTED,
            ride_interface_1.RideStatus.PICKED_UP,
            ride_interface_1.RideStatus.IN_TRANSIT,
            ride_interface_1.RideStatus.COMPLETED,
            ride_interface_1.RideStatus.CANCELLED,
        ].includes(ride.rideStatus)) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, `You cannot cancel a ride that is already in ${ride.rideStatus} state`);
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const cancelledCountToday = yield ride_model_1.Ride.countDocuments({
            riderId: userId,
            rideStatus: ride_interface_1.RideStatus.CANCELLED,
            cancelledBy: ride_interface_1.CancelledBy.RIDER,
            "timestamps.cancelledAt": { $gte: today },
        }).session(session);
        if (cancelledCountToday >= 3) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "You can cancel only 3 rides per day.");
        }
        ride.rideStatus = ride_interface_1.RideStatus.CANCELLED;
        ride.cancelledBy = ride_interface_1.CancelledBy.RIDER;
        ride.timestamps = Object.assign(Object.assign({}, ride.timestamps), { cancelledAt: new Date() });
        yield ride.save({ session });
        user.riderStatus = user_interface_1.RiderStatus.IDLE;
        yield user.save({ session });
        if (ride.driverId) {
            const driver = yield driver_model_1.Driver.findById(ride.driverId).session(session);
            if (driver) {
                driver.ridingStatus = driver_interface_1.DriverRidingStatus.IDLE;
                yield driver.save({ session });
            }
        }
        yield session.commitTransaction();
        session.endSession();
        return {
            data: ride,
        };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const giveFeedbackAndRateDriver = (rideId, userId, feedback, rating) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield ride_model_1.Ride.startSession();
    session.startTransaction();
    try {
        const ride = yield ride_model_1.Ride.findById(rideId).session(session);
        if (!ride)
            throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "Ride not found");
        if (!ride.driverId) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "No driver assigned to this ride");
        }
        // console.log(ride.riderId.toString())
        // console.log(userId)
        if (ride.riderId.toString() !== userId) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "You are not authorized to rate this ride");
        }
        if (ride.rating) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "Feedback already submitted");
        }
        if (ride.rideStatus !== ride_interface_1.RideStatus.COMPLETED) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "Feedback allowed only for completed rides");
        }
        if (rating < 1 || rating > 5) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "Rating must be between 1 and 5");
        }
        const rider = yield user_model_1.User.findById(ride.riderId).session(session);
        if (!rider || rider.isBlocked === user_interface_1.IsBlocked.BLOCKED) {
            throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "User is not allowed to submit feedback");
        }
        ride.feedback = feedback;
        ride.rating = rating;
        yield ride.save({ session });
        const ratedRides = yield ride_model_1.Ride.find({
            driverId: ride.driverId,
            rating: { $exists: true },
        }).session(session);
        const totalRatings = ratedRides.length;
        const totalSum = ratedRides.reduce((sum, r) => sum + (r.rating || 0), 0);
        const averageRating = totalRatings === 0 ? 0 : parseFloat((totalSum / totalRatings).toFixed(1));
        yield driver_model_1.Driver.findByIdAndUpdate(ride.driverId, { rating: averageRating }, { session });
        yield session.commitTransaction();
        session.endSession();
        return {
            rideId: ride._id,
            driverId: ride.driverId,
            averageRating,
        };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
exports.giveFeedbackAndRateDriver = giveFeedbackAndRateDriver;
exports.rideService = {
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
    giveFeedbackAndRateDriver: exports.giveFeedbackAndRateDriver
};
