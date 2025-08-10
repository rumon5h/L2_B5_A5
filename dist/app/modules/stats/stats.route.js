"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const stats_controller_1 = require("./stats.controller");
const router = express_1.default.Router();
router.get("/earning-history", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), stats_controller_1.StatsController.ridesReport);
router.get("/my-earning-history", (0, checkAuth_1.checkAuth)(user_interface_1.Role.DRIVER), stats_controller_1.StatsController.driverReport);
exports.StatsRoutes = router;
