import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { userControllers } from "./user.controller";
import { createUserZodSchema, updateOwnProfileUserZodSchema, updateUserZodSchema } from "./user.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";


const router = Router()

router.get("/all-users", checkAuth(Role.ADMIN), userControllers.getAllUsers)

router.get("/me", checkAuth(...Object.values(Role)), userControllers.getMe)

router.post("/register", validateRequest(createUserZodSchema), userControllers.createUser)

router.patch("/:id", validateRequest(updateOwnProfileUserZodSchema), checkAuth(...Object.values(Role)), userControllers.updateUser)

router.patch("/change-status/:id", validateRequest(updateUserZodSchema), checkAuth(Role.ADMIN), userControllers.updateUserStatus)

router.get("/:id", checkAuth(Role.ADMIN), userControllers.getSingleUser)

export const UserRoutes = router