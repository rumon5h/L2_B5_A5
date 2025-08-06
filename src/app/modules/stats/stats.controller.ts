import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { StatsService } from "./stats.service";
import { JwtPayload } from "jsonwebtoken";

const ridesReport = catchAsync(async (req: Request, res: Response) => {
  const result = await StatsService.getRideStats();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Rides Report Generated!",
    data: result,
  });
});

const driverReport = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const userId = user.userId

  const result = await StatsService.getDriverStats(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Driver Report Generated!",
    data: result,
  });
});


export const StatsController = {
  ridesReport,
  driverReport 
};