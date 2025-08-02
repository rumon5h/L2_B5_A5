import { Types } from "mongoose";

export enum Role {
  ADMIN = "ADMIN",
  RIDER = "RIDER",
  DRIVER = "DRIVER",
}

export enum IsBlocked {
  UNBLOCKED = "UNBLOCKED",
  BLOCKED = "BLOCKED"
}

export interface IAuthProvider {
  provider: "google" | "credentials";
  providerId: string;
}

export enum RiderStatus {
  IDLE = "IDLE",
  REQUESTED = "REQUESTED",
  WAITING = "WAITING",
  PICKED_UP = "PICKED_UP",
  ON_RIDE = "ON_RIDE"
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  picture?: string;

  location?: {
    type: "Point";
    coordinates: [number, number];
  };

  isBlocked?: IsBlocked;
  isVerified?: boolean;
  role: Role;
  auths: IAuthProvider[];
  riderStatus: RiderStatus,

  createdAt?: Date;
  updatedAt?: Date;
}