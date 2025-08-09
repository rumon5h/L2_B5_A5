import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { StatsController } from "./stats.controller";

const router = express.Router();

router.get("/earning-history", checkAuth(Role.ADMIN), StatsController.ridesReport);
router.get("/my-earning-history", checkAuth(Role.DRIVER), StatsController.driverReport);


export const StatsRoutes = router;