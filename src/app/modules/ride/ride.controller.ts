
import { Request, Response } from "express";
import { rideService } from "./ride.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { RideStatus } from "./ride.interface";

const createRide = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const userId = user.userId;



  const payload = {
    ...req.body,
    riderId: userId,
    rideStatus: RideStatus.REQUESTED,
    timestamps: {
      requestedAt: new Date(),
    },
  };

  const result = await rideService.createRide(payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Ride requested successfully",
    data: result.data,
  });
});

const getRidesNearMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const userId = user.userId;

  const result = await rideService.getRidesNearMe(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ride Retrieved successfully",
    data: result.data,
  });
});

const acceptRide = catchAsync(async (req: Request, res: Response) => {
  const driver = req.user as JwtPayload;
  const driverId = driver.userId;
  const rideId = req.params.id


  const acceptedRide = await rideService.acceptRide(driverId, rideId)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Ride Accepted successfully",
    data: acceptedRide.data
  });
});
const rejectRide = catchAsync(async (req: Request, res: Response) => {
  const driver = req.user as JwtPayload;
  const driverId = driver.userId;
  const rideId = req.params.id


  const acceptedRide = await rideService.rejectRide(driverId, rideId)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Ride Rejected successfully",
    data: acceptedRide.data
  });
});

const pickupRider = catchAsync(async (req: Request, res: Response) => {
  const driver = req.user as JwtPayload;
  const driverId = driver.userId;
  const rideId = req.params.id

  const pickedUpRider = await rideService.pickupRider(driverId, rideId)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Rider PickedUp successfully",
    data: pickedUpRider.data
  });
});

const startRide = catchAsync(async (req: Request, res: Response) => {
  const driver = req.user as JwtPayload;
  const driverId = driver.userId;
  const rideId = req.params.id

  const rideInfo = await rideService.startRide(driverId, rideId)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Ride Has Been Started !",
    data: rideInfo.data
  });
});

const completeRide = catchAsync(async (req: Request, res: Response) => {
  const driver = req.user as JwtPayload;
  const driverId = driver.userId;
  const rideId = req.params.id

  const rideInfo = await rideService.completeRide(driverId, rideId)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Ride Has Been Completed !",
    data: rideInfo.data
  });

});


const getAllRidesForAdmin = catchAsync(async (req: Request, res: Response) => {

  const rideInfo = await rideService.getAllRidesForAdmin()

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "All Rides Retrieved For Admin !",
    data: rideInfo.allRides
  });

});

const getAllRidesForRider = catchAsync(async (req: Request, res: Response) => {

  const rider = req.user as JwtPayload
  const riderId = rider.userId

  const rideInfo = await rideService.getAllRidesForRider(riderId)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Rides Made By You are Retrieved!",
    data: rideInfo.data
  });

});
const getAllRidesForDriver = catchAsync(async (req: Request, res: Response) => {

  const user = req.user as JwtPayload
  const userId = user.userId

  const rideInfo = await rideService.getAllRidesForDriver(userId)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Rides Made By You are Retrieved!",
    data: rideInfo.data
  });

});
const getSingleRideForRider = catchAsync(async (req: Request, res: Response) => {
  const rideId = req.params.id
  const riderInfo = req.user as JwtPayload

  const riderId = riderInfo.userId

  const result = await rideService.getSingleRideForRider(rideId, riderId)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Your Ride Information Retrieved!",
    data: result.data
  });

});


const getDriversNearMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const userId = user.userId;

  const result = await rideService.getDriversNearMe(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message:
      result.count === 0
        ? "Please wait. For now, there is no driver available near you."
        : "Available Drivers Retrieved Successfully!",
    data: result.data,
  });
});


const cancelRideByRider = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const userId = user.userId;

  const rideId = req.params.id

  const result = await rideService.cancelRideByRider(userId, rideId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your Ride Has Been Cancelled!",
    data: result.data,
  });
});


const giveFeedback = catchAsync(async (req: Request, res: Response) => {
  const { rideId } = req.params;
  const { feedback, rating } = req.body;
  const user = req.user as JwtPayload
  const userId = user.userId


  const result = await rideService.giveFeedbackAndRateDriver(rideId, userId, feedback, rating);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Feedback submitted successfully",
    data: result,
  });
});

export const rideController = {
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