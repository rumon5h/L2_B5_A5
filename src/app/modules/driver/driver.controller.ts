/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextFunction, Request, Response } from "express";

import httpStatus from "http-status-codes"


import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import { IDriver } from "./driver.interface";
import { driverServices } from "./driver.service";
import { JwtPayload } from "jsonwebtoken";


const createDriver = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as JwtPayload
  const userId = user.userId

  const payload: IDriver = {
    ...req.body,
    userId,
    drivingLicense: req.body?.file?.path 
  }
  const driver = await driverServices.createDriver(payload)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Driver Created Successfully",
    data: driver
  })
})

const updateDriverStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { driverStatus } = req.body;

  const result = await driverServices.updateDriverStatus(id, driverStatus);

  res.status(httpStatus.OK).json({
    success: true,
    message: `Driver status updated to ${driverStatus}`,
    data: result,
  });
});

const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const decodedToken = req.user as JwtPayload
  const result = await driverServices.getMe(decodedToken.userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your Driver Profile Retrieved Successfully",
    data: result.data
  })
})


const updateMyDriverProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const userId = user.userId;
  const updateData = { ...req.body };

  if (req.body?.file?.path) {
    updateData.drivingLicense = req.body.file.path;
  }

  const updatedDriver = await driverServices.updateMyDriverProfile(userId, updateData);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Driver profile updated successfully",
    data: updatedDriver,
  });
});

const getAllDrivers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await driverServices.getAllDrivers();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "All Driver Retrieved Successfully",
    data: result.data
  })
})
const getSingleDriver = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const result = await driverServices.getSingleDriver(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Driver Retrieved Successfully",
    data: result.data
  })
})

const goOnline = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userId = user.userId;
  const currentLocation = req.body;
  const result = await driverServices.goOnline(userId,currentLocation);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "You are Online Now!",
    data: result.data
  })
});

const goOffline = catchAsync(async (req, res) => {
   const user = req.user as JwtPayload;
  const userId = user.userId;

  const result = await driverServices.goOffline(userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "You Have Became Offline Now!",
    data: result.data
  })
});


export const driverControllers = {
  createDriver,
  updateDriverStatus,
  getMe,
  updateMyDriverProfile,
  getSingleDriver,
  getAllDrivers,
  goOffline,
  goOnline

}