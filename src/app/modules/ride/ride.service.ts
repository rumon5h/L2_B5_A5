
import { Ride } from "./ride.model";
import { CancelledBy, IRide, RideStatus } from "./ride.interface";
import { calculateDistanceAndFare } from "../../utils/calculateDistanceAndFare";
import { IsBlocked, IUser, RiderStatus } from "../user/user.interface";
import { User } from "../user/user.model";
import httpStatus from 'http-status-codes';
import AppError from "../../errorHelpers/appErrors";
import { Driver } from "../driver/driver.model";
import { DriverOnlineStatus, DriverRidingStatus, DriverStatus, IDriver } from "../driver/driver.interface";
import haversine from 'haversine-distance';


const createRide = async (payload: IRide) => {
  const { pickupLocation, destination } = payload;

  const session = await Ride.startSession();
  session.startTransaction();

  try {
    const rider = await User.findById(payload.riderId).session(session);
    if (!rider) {
      throw new AppError(httpStatus.NOT_FOUND, "Rider not found.");
    }

    if (rider.isBlocked === IsBlocked.BLOCKED) {
      throw new AppError(httpStatus.BAD_REQUEST, "You are blocked. Contact admin.");
    }
    if (rider.riderStatus === RiderStatus.REQUESTED || rider.riderStatus === RiderStatus.ON_RIDE) {
      throw new AppError(httpStatus.BAD_REQUEST, `You already have a ride in ${rider.riderStatus} State.`);
    }

    const { distanceKm, fare } = calculateDistanceAndFare(
      pickupLocation.coordinates,
      destination.coordinates
    );

    const ride = await Ride.create([{ ...payload, travelDistance: distanceKm, fare }], { session });

    await User.findByIdAndUpdate(payload.riderId, { riderStatus: RiderStatus.REQUESTED }, { session });

    await session.commitTransaction();
    session.endSession();

    return { data: ride[0] };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getRidesNearMe = async (userId: string) => {
  const user: IUser | null = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found.");
  }

  if (user && user.isBlocked === IsBlocked.BLOCKED) {
    throw new AppError(httpStatus.BAD_REQUEST, "You are blocked. Contact Admin.");
  }

  const driver: IDriver | null = await Driver.findOne({ userId });

  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found.");
  }

  if (driver.driverStatus !== DriverStatus.APPROVED) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `Driver is not approved to accept rides. Your status is currently: ${driver.driverStatus}`
    );
  }

  if (driver.onlineStatus === DriverOnlineStatus.OFFLINE) {
    throw new AppError(httpStatus.BAD_REQUEST, "Go Online To See The Rides Around You!");
  }

  if (!driver.currentLocation || !driver.currentLocation.coordinates) {
    throw new AppError(httpStatus.BAD_REQUEST, "Driver location is not set.");
  }

  const requestedRides: IRide[] = await Ride.find({
    rideStatus: RideStatus.REQUESTED,
  });

  const nearByRides = requestedRides.filter((ride) => {
    if (ride.rejectedBy?.some(id => id.toString() === driver._id.toString())) {
      return false;
    }
    if (!ride.pickupLocation?.coordinates || !driver.currentLocation?.coordinates) return false;

    const [pickupLng, pickupLat] = ride.pickupLocation.coordinates;
    const [driverLng, driverLat] = driver.currentLocation.coordinates;

    const distanceInMeters = haversine(
      { lat: driverLat, lon: driverLng },
      { lat: pickupLat, lon: pickupLng }
    );
    return distanceInMeters <= 1000;
  });

  return {
    success: true,
    data: nearByRides,
  };
};

const acceptRide = async (driverUserId: string, rideId: string) => {
  const session = await Ride.startSession();
  session.startTransaction();

  try {
    const driver = await Driver.findOne({ userId: driverUserId }).session(session);
    if (!driver) {
      throw new AppError(httpStatus.NOT_FOUND, "Driver not found.");
    }

    if (driver.driverStatus === DriverStatus.SUSPENDED) {
      throw new AppError(httpStatus.BAD_REQUEST, "You are suspended. Cannot accept rides.");
    }
    if (driver.onlineStatus === DriverOnlineStatus.OFFLINE) {
      throw new AppError(httpStatus.BAD_REQUEST, "First go Online Then Try To Accept!");
    }

    if (driver.ridingStatus !== DriverRidingStatus.IDLE) {
      throw new AppError(httpStatus.BAD_REQUEST, "You can Not Accept another Ride While Engaged In a Trip Already");
    }

    const ride = await Ride.findById(rideId).session(session);
    if (!ride) {
      throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");
    }

    if (ride.rideStatus !== RideStatus.REQUESTED) {
      throw new AppError(httpStatus.BAD_REQUEST, `Ride is Already ${ride.rideStatus}`);
    }


    if (ride.rejectedBy?.some((id) => id.toString() === driver._id.toString())) {
      throw new AppError(httpStatus.BAD_REQUEST, "You have already rejected this ride.");
    }


    if (String(driver.userId) === String(ride.riderId)) {
      throw new AppError(httpStatus.BAD_REQUEST, "You cannot accept your own ride.");
    }

    const rider = await User.findById(ride.riderId).session(session);
    if (!rider) {
      throw new AppError(httpStatus.NOT_FOUND, "Rider not found.");
    }

    ride.driverId = driver._id;
    ride.rideStatus = RideStatus.ACCEPTED;
    ride.timestamps = {
      ...ride.timestamps,
      acceptedAt: new Date(),
    };
    await ride.save({ session });

    driver.ridingStatus = DriverRidingStatus.ACCEPTED;
    await driver.save({ session });

    rider.riderStatus = RiderStatus.WAITING;
    await rider.save({ session });


    const data = {
      rideId : ride._id,
      riderName: rider.name,
      riderPhone: rider.phone
    }

    await session.commitTransaction();
    session.endSession();

    return {
      data: data
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
const rejectRide = async (driverUserId: string, rideId: string) => {
  const session = await Ride.startSession();
  session.startTransaction();

  try {
    const driver = await Driver.findOne({ userId: driverUserId }).session(session);
    if (!driver) {
      throw new AppError(httpStatus.NOT_FOUND, "Driver not found.");
    }

    if (driver.driverStatus === DriverStatus.SUSPENDED) {
      throw new AppError(httpStatus.BAD_REQUEST, "You are suspended. Cannot accept or reject rides.");
    }

    if (driver.onlineStatus === DriverOnlineStatus.OFFLINE) {
      throw new AppError(httpStatus.BAD_REQUEST, "First go online, then try to accept or reject!");
    }

    if (driver.ridingStatus !== DriverRidingStatus.IDLE) {
      throw new AppError(httpStatus.BAD_REQUEST, "You cannot accept or reject another ride while already in a trip.");
    }

    const ride = await Ride.findById(rideId).session(session);
    if (!ride) {
      throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");
    }

    if (ride.rideStatus !== RideStatus.REQUESTED) {
      throw new AppError(httpStatus.BAD_REQUEST, `Ride is already ${ride.rideStatus}.`);
    }

    if (String(driver.userId) === String(ride.riderId)) {
      throw new AppError(httpStatus.BAD_REQUEST, "You cannot reject your own ride.");
    }

    const rider = await User.findById(ride.riderId).session(session);
    if (!rider) {
      throw new AppError(httpStatus.NOT_FOUND, "Rider not found.");
    }


    if (!ride.rejectedBy.includes(driver._id)) {
      ride.rejectedBy.push(driver._id);
    }

    await ride.save({ session });

    driver.rejectedRides += 1;
    await driver.save({ session });

    const data = {
      riderName: rider.name,
      riderPhone: rider.phone
    };

    await session.commitTransaction();
    session.endSession();

    return { data };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};


const pickupRider = async (driverUserId: string, rideId: string) => {
  const session = await Ride.startSession();
  session.startTransaction();

  try {
    const driver = await Driver.findOne({ userId: driverUserId }).session(session);
    if (!driver) {
      throw new AppError(httpStatus.NOT_FOUND, "Driver not found.");
    }

    if (driver.driverStatus === DriverStatus.SUSPENDED) {
      throw new AppError(httpStatus.BAD_REQUEST, "You are suspended. Cannot complete.");
    }


    if (driver.onlineStatus === DriverOnlineStatus.OFFLINE) {
      throw new AppError(httpStatus.BAD_REQUEST, "Go Online To Pickup The Rider!");
    }

    const ride = await Ride.findById(rideId).session(session);
    if (!ride) {
      throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");
    }

    if (!ride.driverId) {
      throw new AppError(httpStatus.BAD_REQUEST, "You Have Not Accepted This Ride Yet! Accept First!");
    }

    if (String(driver._id) !== String(ride.driverId)) {
      throw new AppError(httpStatus.BAD_REQUEST, "You cannot pick up another driver's rider!");
    }

    if ([RideStatus.PICKED_UP, RideStatus.IN_TRANSIT, RideStatus.COMPLETED].includes(ride.rideStatus)) {
      throw new AppError(httpStatus.BAD_REQUEST, `This ride is already in ${ride.rideStatus} State.`);
    }

    if (ride.rideStatus === RideStatus.CANCELLED) {
      throw new AppError(httpStatus.BAD_REQUEST, "This ride was cancelled.");
    }

    if (ride.rideStatus !== RideStatus.ACCEPTED) {
      throw new AppError(httpStatus.BAD_REQUEST, "You must accept the ride first.");
    }

    if (String(driver.userId) === String(ride.riderId)) {
      throw new AppError(httpStatus.BAD_REQUEST, "You cannot pick up your own ride.");
    }

    const rider = await User.findById(ride.riderId).session(session);
    if (!rider) {
      throw new AppError(httpStatus.NOT_FOUND, "Rider not found.");
    }

    ride.rideStatus = RideStatus.PICKED_UP;
    ride.timestamps = {
      ...ride.timestamps,
      pickedUpAt: new Date(),
    };
    await ride.save({ session });

    driver.ridingStatus = DriverRidingStatus.RIDING;
    await driver.save({ session });

    rider.riderStatus = RiderStatus.PICKED_UP;
    await rider.save({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      data: {
        rideId : ride._id,
        riderDestination: ride.destination,
        totalFare: ride.fare,
      },
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
const startRide = async (driverUserId: string, rideId: string) => {
  const session = await Ride.startSession();
  session.startTransaction();

  try {
    const driver = await Driver.findOne({ userId: driverUserId }).session(session);
    if (!driver) {
      throw new AppError(httpStatus.NOT_FOUND, "Driver not found.");
    }

    if (driver.driverStatus === DriverStatus.SUSPENDED) {
      throw new AppError(httpStatus.BAD_REQUEST, "You are suspended. Cannot complete.");
    }


    if (driver.onlineStatus === DriverOnlineStatus.OFFLINE) {
      throw new AppError(httpStatus.BAD_REQUEST, "Go Online To start The Ride!");
    }

    const ride = await Ride.findById(rideId).session(session);
    if (!ride) {
      throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");
    }

    if (!ride.driverId) {
      throw new AppError(httpStatus.BAD_REQUEST, "You Have Not Accepted This Ride Yet! Accept First!");
    }

    if (String(driver._id) !== String(ride.driverId)) {
      throw new AppError(httpStatus.BAD_REQUEST, "You cannot Start Riding with another driver's rider!");
    }

    if (ride.rideStatus === RideStatus.CANCELLED) {
      throw new AppError(httpStatus.BAD_REQUEST, "This ride was cancelled.");
    }

    if ([RideStatus.IN_TRANSIT, RideStatus.COMPLETED].includes(ride.rideStatus)) {
      throw new AppError(httpStatus.BAD_REQUEST, `This ride is already in ${ride.rideStatus} State.`);
    }

    if (ride.rideStatus !== RideStatus.PICKED_UP) {
      throw new AppError(httpStatus.BAD_REQUEST, "You must Pickup Rider To Start The Ride.");
    }

    if (String(driver.userId) === String(ride.riderId)) {
      throw new AppError(httpStatus.BAD_REQUEST, "You cannot Run your ride with Your Owns.");
    }

    const rider = await User.findById(ride.riderId).session(session);
    if (!rider) {
      throw new AppError(httpStatus.NOT_FOUND, "Rider not found.");
    }

    ride.rideStatus = RideStatus.IN_TRANSIT;
    ride.timestamps = {
      ...ride.timestamps,
      startedAt: new Date(),
    };
    await ride.save({ session });

    driver.ridingStatus = DriverRidingStatus.RIDING;
    await driver.save({ session });

    rider.riderStatus = RiderStatus.ON_RIDE;
    await rider.save({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      data: {
        rideId : ride._id,
        riderDestination: ride.destination,
        totalFare: ride.fare,
      },
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
const completeRide = async (driverUserId: string, rideId: string) => {
  const session = await Ride.startSession();
  session.startTransaction();

  try {
    const driver = await Driver.findOne({ userId: driverUserId }).session(session);
    if (!driver) {
      throw new AppError(httpStatus.NOT_FOUND, "Driver not found.");
    }

    if (driver.driverStatus === DriverStatus.SUSPENDED) {
      throw new AppError(httpStatus.BAD_REQUEST, "You are suspended. Cannot complete.");
    }


    if (driver.onlineStatus === DriverOnlineStatus.OFFLINE) {
      throw new AppError(httpStatus.BAD_REQUEST, "Go Online To Pickup The Rider!");
    }

    const ride = await Ride.findById(rideId).session(session);
    if (!ride) {
      throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");
    }

    if (!ride.driverId) {
      throw new AppError(httpStatus.BAD_REQUEST, "You Have Not Accepted This Ride Yet! Accept First!");
    }

    if (String(driver._id) !== String(ride.driverId)) {
      throw new AppError(httpStatus.BAD_REQUEST, "You cannot Start Riding with another driver's rider!");
    }

    if (ride.rideStatus === RideStatus.CANCELLED) {
      throw new AppError(httpStatus.BAD_REQUEST, "This ride was cancelled.");
    }

    if ([RideStatus.COMPLETED].includes(ride.rideStatus)) {
      throw new AppError(httpStatus.BAD_REQUEST, `This ride is already in ${ride.rideStatus} State.`);
    }

    if (ride.rideStatus !== RideStatus.IN_TRANSIT) {
      throw new AppError(httpStatus.BAD_REQUEST, "You must Start Ride To Finish The Ride!.");
    }

    if (String(driver.userId) === String(ride.riderId)) {
      throw new AppError(httpStatus.BAD_REQUEST, "You cannot Run your ride with Your Owns.");
    }

    const rider = await User.findById(ride.riderId).session(session);
    if (!rider) {
      throw new AppError(httpStatus.NOT_FOUND, "Rider not found.");
    }

    ride.rideStatus = RideStatus.COMPLETED;
    ride.timestamps = {
      ...ride.timestamps,
      completedAt: new Date(),
    };
    await ride.save({ session });

    driver.ridingStatus = DriverRidingStatus.IDLE;
    driver.totalEarning = Number(driver.totalEarning || 0) + Number(ride.fare || 0);
    driver.totalRides = Number(driver.totalRides || 0) + 1;
    driver.currentLocation = ride.destination;
    await driver.save({ session });

    rider.riderStatus = RiderStatus.IDLE;
    await rider.save({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      data: {
        rideId : ride._id,
        totalIncome: ride.fare,
      },
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAllRidesForAdmin = async () => {
  const allRides = await Ride.find({})

  return {
    allRides
  }
}
const getAllRidesForRider = async (riderId: string) => {

  const myRides = await Ride.find({ riderId: { $eq: riderId } })

  const myRideCounts = await Ride.countDocuments()

  const data = {
    myRideCounts,
    myRides
  }

  return {
    data
  }
}
const getAllRidesForDriver = async (userId: string) => {
  const driver = await Driver.findOne({ userId })

  if (!driver) {
    throw new AppError(httpStatus.BAD_REQUEST, "Driver InFormation Not Found !")
  }

  const driverId = driver._id

  const allRides = await Ride.find({ driverId: { $eq: driverId } })

   const myRideCounts = allRides.length;

  const data = {
    myRideCounts,
    allRides
  }
  return {
    data
  }
}
const getSingleRideForRider = async (rideId: string, riderId: string) => {

  const data = await Ride.findById(rideId)

  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride Information Not Found")
  }


  if (String(data.riderId) !== riderId) {
    throw new AppError(httpStatus.BAD_REQUEST, "This Ride Is Not Yours!")
  }

  return {
    data
  }
}


const getDriversNearMe = async (userId: string) => {
  const user: IUser | null = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found.");
  }

  if (user.isBlocked === IsBlocked.BLOCKED) {
    throw new AppError(httpStatus.BAD_REQUEST, "You are blocked. Contact Admin.");
  }

  const latestRide = await Ride.findOne({ riderId: userId }).sort({ createdAt: -1 });
  if (!latestRide || !latestRide.pickupLocation?.coordinates?.length) {
    throw new AppError(httpStatus.BAD_REQUEST, "Your location not found.");
  }

  const [pickupLng, pickupLat] = latestRide.pickupLocation.coordinates;

  const drivers: IDriver[] = await Driver.find(
    {
      driverStatus: DriverStatus.APPROVED,
      onlineStatus: DriverOnlineStatus.ONLINE,
      ridingStatus: { $ne: DriverRidingStatus.RIDING },
      currentLocation: { $exists: true, $ne: null },
    },
    {
      vehicle: 1,
      currentLocation: 1,
    }
  ).populate("userId", "name phone");


  const nearbyDrivers = drivers.filter((driver) => {

    if (!driver.currentLocation?.coordinates?.length) return false;

    const [driverLng, driverLat] = driver.currentLocation.coordinates;

    const distanceInMeters = haversine(
      { lat: pickupLat, lon: pickupLng },
      { lat: driverLat, lon: driverLng }
    );

    return distanceInMeters <= 1000;
  });

  return {
    success: true,
    count: nearbyDrivers.length,
    data: nearbyDrivers,
  };
};

const cancelRideByRider = async (userId: string, rideId: string) => {
  const session = await Ride.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found.");
    }

    const ride = await Ride.findById(rideId).session(session);

    if (!ride) {
      throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");
    }

    if (String(ride.riderId) !== String(userId)) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to cancel this ride.");
    }

    if (
      [
        RideStatus.ACCEPTED,
        RideStatus.PICKED_UP,
        RideStatus.IN_TRANSIT,
        RideStatus.COMPLETED,
        RideStatus.CANCELLED,
      ].includes(ride.rideStatus)
    ) {
      throw new AppError(httpStatus.BAD_REQUEST, `You cannot cancel a ride that is already in ${ride.rideStatus} state`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cancelledCountToday = await Ride.countDocuments({
      riderId: userId,
      rideStatus: RideStatus.CANCELLED,
      cancelledBy: CancelledBy.RIDER,
      "timestamps.cancelledAt": { $gte: today },
    }).session(session);

    if (cancelledCountToday >= 3) {
      throw new AppError(httpStatus.BAD_REQUEST, "You can cancel only 3 rides per day.");
    }
    ride.rideStatus = RideStatus.CANCELLED;
    ride.cancelledBy = CancelledBy.RIDER;
    ride.timestamps = {
      ...ride.timestamps,
      cancelledAt: new Date(),
    };
    await ride.save({ session });

    user.riderStatus = RiderStatus.IDLE;
    await user.save({ session });

    if (ride.driverId) {
      const driver = await Driver.findById(ride.driverId).session(session);
      if (driver) {
        driver.ridingStatus = DriverRidingStatus.IDLE;
        await driver.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    return {
      data: ride,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};



export const giveFeedbackAndRateDriver = async (rideId: string, userId: string, feedback: string, rating: number) => {
  const session = await Ride.startSession();
  session.startTransaction();

  try {
    const ride = await Ride.findById(rideId).session(session);
    if (!ride) throw new AppError(httpStatus.NOT_FOUND, "Ride not found");

    if (!ride.driverId) {
      throw new AppError(httpStatus.BAD_REQUEST, "No driver assigned to this ride");
    }

    // console.log(ride.riderId.toString())
    // console.log(userId)

    if (ride.riderId.toString() !== userId) {
      throw new AppError(httpStatus.BAD_REQUEST, "You are not authorized to rate this ride");
    }
    

    if (ride.rating) {
      throw new AppError(httpStatus.BAD_REQUEST, "Feedback already submitted");
    }

    if (ride.rideStatus !== RideStatus.COMPLETED) {
      throw new AppError(httpStatus.BAD_REQUEST, "Feedback allowed only for completed rides");
    }


    if (rating < 1 || rating > 5) {
      throw new AppError(httpStatus.BAD_REQUEST, "Rating must be between 1 and 5");
    }

    const rider = await User.findById(ride.riderId).session(session);

    if (!rider || rider.isBlocked === IsBlocked.BLOCKED) {
      throw new AppError(httpStatus.BAD_REQUEST, "User is not allowed to submit feedback");
    }

    ride.feedback = feedback;
    ride.rating = rating;
    await ride.save({ session });

    const ratedRides = await Ride.find({
      driverId: ride.driverId,
      rating: { $exists: true },
    }).session(session);

    const totalRatings = ratedRides.length;
    const totalSum = ratedRides.reduce((sum, r) => sum + (r.rating || 0), 0);
    const averageRating = totalRatings === 0 ? 0 : parseFloat((totalSum / totalRatings).toFixed(1));

    await Driver.findByIdAndUpdate(
      ride.driverId,
      { rating: averageRating },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return {
      rideId: ride._id,
      driverId: ride.driverId,
      averageRating,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};


export const rideService = {
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
  giveFeedbackAndRateDriver
};
