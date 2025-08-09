import AppError from "../../errorHelpers/appErrors";
import { DriverStatus, ICurrentLocation, IDriver } from "./driver.interface";
import { Driver } from "./driver.model";
import httpStatus from 'http-status-codes';
import { User } from "../user/user.model";
import {IsBlocked, Role } from "../user/user.interface";

const createDriver = async (payload: IDriver) => {
  const user = await User.findById(payload.userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (user.isBlocked === IsBlocked.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "Your account is blocked. Contact support.");
  }
  if (!user.isVerified) {
    throw new AppError(httpStatus.FORBIDDEN, "Your account is not Verified. Contact support.");
  }

  if (!user.phone) {
    throw new AppError(httpStatus.BAD_REQUEST, "Please update your phone number in user profile before applying.");
  }

  if (!user.location || !user.location.coordinates || user.location.coordinates.length !== 2) {
    throw new AppError(httpStatus.BAD_REQUEST, "Please update your location In User Profile before applying.");
  }

  const existingDriver = await Driver.findOne({ userId: payload.userId });

  if (existingDriver) {
    if (existingDriver.driverStatus === DriverStatus.PENDING) {
      throw new AppError(httpStatus.BAD_REQUEST, "Please wait for admin approval!");
    }
    if (existingDriver.driverStatus === DriverStatus.SUSPENDED) {
      throw new AppError(httpStatus.BAD_REQUEST, "You are suspended. Please contact the office!");
    }
    throw new AppError(httpStatus.BAD_REQUEST, "Driver profile already exists.");
  }

  const driver = await Driver.create(payload);
  return driver;
};

export const updateDriverStatus = async (id: string, driverStatus: DriverStatus) => {
  const session = await Driver.startSession();
  session.startTransaction();

  try {
    const driver = await Driver.findById(id).session(session);
    if (!driver) {
      throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
    }


    if (driver.driverStatus === DriverStatus.APPROVED && driverStatus === DriverStatus.APPROVED) {
      throw new AppError(httpStatus.BAD_REQUEST, "Driver is already approved");
    }

    driver.driverStatus = driverStatus;
    await driver.save({ session });

    if (driverStatus === DriverStatus.APPROVED) {
      await User.findByIdAndUpdate(driver.userId, { role: Role.DRIVER }, { session });
    }

    await session.commitTransaction();
    session.endSession();

    return driver;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getMe = async (userId: string) => {
  const driver = await Driver.findOne({ userId })
  // console.log(driver)
  return {
    data: driver
  }
};

const updateMyDriverProfile = async (userId: string, updatedData: Partial<IDriver>) => {

  const driver = await Driver.findOne({ userId });
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
  }

  const updatedDriver = await Driver.findOneAndUpdate(
    { userId: userId },
    updatedData,
    { new: true, runValidators: true }
  );

  return {
    data: updatedDriver
  }
};


const getAllDrivers = async () => {
  const drivers = await Driver.find({})
  return {
    data: drivers,
  }
}


const getSingleDriver = async (id: string) => {
  const driver = await Driver.findById(id).populate({
    path: "userId",
    select: "-password -auths"
  });


  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
  }

  return {
    data: driver
  }
};

const goOnline = async (userId: string, currentLocation: ICurrentLocation) => {
  const driverInfo = await Driver.findOne({ userId });
  if (!driverInfo) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
  }

  const driver = await Driver.findOneAndUpdate(
    { userId },
    {
      onlineStatus: "ONLINE",
      currentLocation: currentLocation,
    },
    { new: true }
  );
  return { data: driver };
};

const goOffline = async (userId: string) => {

  const driverInfo = await Driver.findOne({ userId });
  if (!driverInfo) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
  }

  const driver = await Driver.findOneAndUpdate(
    { userId },
    {
      onlineStatus: "OFFLINE",
      currentLocation: {
        type: "Point",
        coordinates: [],
      },
    },
    { new: true }
  );
  return { data: driver };
};

export const driverServices = {
  createDriver,
  updateDriverStatus,
  getMe,
  updateMyDriverProfile,
  getAllDrivers,
  getSingleDriver,
  goOffline,
  goOnline
};

