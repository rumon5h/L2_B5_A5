"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const validateRequest_1 = require("../../middlewares/validateRequest");
const driver_validation_1 = require("./driver.validation");
const multer_config_1 = require("../../config/multer.config");
const driver_controller_1 = require("./driver.controller");
const router = (0, express_1.Router)();
router.get("/all-drivers", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), driver_controller_1.driverControllers.getAllDrivers);
router.post("/register", (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), multer_config_1.multerUpload.single("file"), (0, validateRequest_1.validateRequest)(driver_validation_1.createDriverZodSchema), driver_controller_1.driverControllers.createDriver);
router.get("/me", (0, checkAuth_1.checkAuth)(user_interface_1.Role.DRIVER), driver_controller_1.driverControllers.getMe);
// update rider profile 
router.patch("/update-profile", (0, checkAuth_1.checkAuth)(user_interface_1.Role.DRIVER), multer_config_1.multerUpload.single("file"), (0, validateRequest_1.validateRequest)(driver_validation_1.updateDriverProfileZodSchema), driver_controller_1.driverControllers.updateMyDriverProfile);
// go online or offline 
router.patch("/go-online", (0, checkAuth_1.checkAuth)(user_interface_1.Role.DRIVER), (0, validateRequest_1.validateRequest)(driver_validation_1.goOnlineZodSchema), driver_controller_1.driverControllers.goOnline);
router.post("/go-offline", (0, checkAuth_1.checkAuth)(user_interface_1.Role.DRIVER), driver_controller_1.driverControllers.goOffline);
router.patch("/status/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), (0, validateRequest_1.validateRequest)(driver_validation_1.updateDriverStatusZodSchema), driver_controller_1.driverControllers.updateDriverStatus);
router.get("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), driver_controller_1.driverControllers.getSingleDriver);
exports.DriverRoutes = router;
