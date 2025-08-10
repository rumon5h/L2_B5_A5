"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverStatus = exports.DriverRidingStatus = exports.VehicleType = exports.DriverOnlineStatus = void 0;
var DriverOnlineStatus;
(function (DriverOnlineStatus) {
    DriverOnlineStatus["ONLINE"] = "ONLINE";
    DriverOnlineStatus["OFFLINE"] = "OFFLINE";
})(DriverOnlineStatus || (exports.DriverOnlineStatus = DriverOnlineStatus = {}));
var VehicleType;
(function (VehicleType) {
    VehicleType["CAR"] = "CAR";
    VehicleType["BIKE"] = "BIKE";
})(VehicleType || (exports.VehicleType = VehicleType = {}));
var DriverRidingStatus;
(function (DriverRidingStatus) {
    DriverRidingStatus["IDLE"] = "IDLE";
    DriverRidingStatus["ACCEPTED"] = "ACCEPTED";
    DriverRidingStatus["RIDING"] = "RIDING";
})(DriverRidingStatus || (exports.DriverRidingStatus = DriverRidingStatus = {}));
var DriverStatus;
(function (DriverStatus) {
    DriverStatus["APPROVED"] = "APPROVED";
    DriverStatus["PENDING"] = "PENDING";
    DriverStatus["SUSPENDED"] = "SUSPENDED";
})(DriverStatus || (exports.DriverStatus = DriverStatus = {}));
