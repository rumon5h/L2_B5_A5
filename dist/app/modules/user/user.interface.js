"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsBlocked = exports.RiderStatus = exports.Role = void 0;
var Role;
(function (Role) {
    Role["ADMIN"] = "ADMIN";
    Role["RIDER"] = "RIDER";
    Role["DRIVER"] = "DRIVER";
})(Role || (exports.Role = Role = {}));
var RiderStatus;
(function (RiderStatus) {
    RiderStatus["IDLE"] = "IDLE";
    RiderStatus["REQUESTED"] = "REQUESTED";
    RiderStatus["WAITING"] = "WAITING";
    RiderStatus["PICKED_UP"] = "PICKED_UP";
    RiderStatus["ON_RIDE"] = "ON_RIDE";
})(RiderStatus || (exports.RiderStatus = RiderStatus = {}));
var IsBlocked;
(function (IsBlocked) {
    IsBlocked["UNBLOCKED"] = "UNBLOCKED";
    IsBlocked["BLOCKED"] = "BLOCKED";
})(IsBlocked || (exports.IsBlocked = IsBlocked = {}));
