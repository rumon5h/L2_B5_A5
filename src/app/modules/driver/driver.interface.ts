import { Types } from "mongoose";

export interface IVehicle {
  vehicleNumber: string;
  vehicleType: VehicleType;
}

export enum DriverOnlineStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
}

export interface ICurrentLocation {
  type: "Point";
  coordinates: [number, number];
}

export enum VehicleType {
  CAR = "CAR",
  BIKE = "BIKE",
}

export enum DriverRidingStatus {
  IDLE = "IDLE",
  ACCEPTED = "ACCEPTED",
  RIDING = "RIDING"
}

export enum DriverStatus {
  APPROVED = "APPROVED",
  PENDING = "PENDING",
  SUSPENDED = "SUSPENDED",
}

export interface IDriver {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  vehicle: IVehicle;
  onlineStatus: DriverOnlineStatus;
  currentLocation?: ICurrentLocation;
  ridingStatus: DriverRidingStatus;
  rejectedRides: number,
  totalRides?: number,
  drivingLicense: string;
  totalEarning?: number;
  driverStatus: DriverStatus;
  rating: number 
}