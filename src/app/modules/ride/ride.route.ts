import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { createRideZodSchema, rideFeedbackSchema } from "./ride.validation";
import { rideController } from "./ride.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router()

router.post(
  "/request",
  checkAuth(...Object.values(Role)),
  validateRequest(createRideZodSchema),
  rideController.createRide
);

router.get("/rides-near",
  checkAuth(Role.DRIVER),
  rideController.getRidesNearMe
)

router.get("/all-rides-admin",
  checkAuth(Role.ADMIN),
  rideController.getAllRidesForAdmin
)

router.get("/all-rides-rider",
  checkAuth(...Object.values(Role)),
  rideController.getAllRidesForRider
)

router.get("/all-rides-driver",
  checkAuth(Role.DRIVER),
  rideController.getAllRidesForDriver
)

router.get("/drivers-near",
  checkAuth(...Object.values(Role)),
  rideController.getDriversNearMe
)

router.get("/my-ride/:id",
  checkAuth(...Object.values(Role)),
  rideController.getSingleRideForRider
)

router.patch("/cancel-ride/:id", checkAuth(...Object.values(Role)), rideController.cancelRideByRider)

router.patch("/reject-ride/:id", checkAuth(Role.DRIVER), rideController.rejectRide)

router.patch("/accept-ride/:id", checkAuth(Role.DRIVER), rideController.acceptRide)

router.patch("/pickup-rider/:id", checkAuth(Role.DRIVER), rideController.pickupRider)

router.patch("/start-ride/:id", checkAuth(Role.DRIVER), rideController.startRide)

router.patch("/complete-ride/:id", checkAuth(Role.DRIVER), rideController.completeRide)

router.post(
  "/feedback/:rideId",
  checkAuth(...Object.values(Role)),
  validateRequest(rideFeedbackSchema),
  rideController.giveFeedback
);

export const RideRoutes = router