import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import { createDriverZodSchema, goOnlineZodSchema, updateDriverProfileZodSchema, updateDriverStatusZodSchema } from "./driver.validation";
import { multerUpload } from "../../config/multer.config";
import { driverControllers } from "./driver.controller";

const router = Router()

router.get("/all-drivers", checkAuth(Role.ADMIN), driverControllers.getAllDrivers)

router.post("/register",
    checkAuth(...Object.values(Role)),
    multerUpload.single("file"),
    validateRequest(createDriverZodSchema),
    driverControllers.createDriver
)
router.get("/me", checkAuth(Role.DRIVER), driverControllers.getMe)

// update rider profile 

router.patch(
  "/update-profile",
  checkAuth(Role.DRIVER),
  multerUpload.single("file"),          
  validateRequest(updateDriverProfileZodSchema), 
  driverControllers.updateMyDriverProfile
);

// go online or offline 

router.patch(
  "/go-online",
  checkAuth(Role.DRIVER),
  validateRequest(goOnlineZodSchema),
  driverControllers.goOnline
);

router.post(
  "/go-offline",
  checkAuth(Role.DRIVER),
  driverControllers.goOffline
);

router.patch("/status/:id",
    checkAuth(Role.ADMIN),
    validateRequest(updateDriverStatusZodSchema),
    driverControllers.updateDriverStatus
)
router.get("/:id",checkAuth(Role.ADMIN), driverControllers.getSingleDriver)


export const DriverRoutes = router