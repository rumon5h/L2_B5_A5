/* eslint-disable no-console */
import { envVars } from "../config/env"
import { IAuthProvider, IUser, Role, RiderStatus } from '../modules/user/user.interface';
import { User } from "../modules/user/user.model"
import bcryptjs from 'bcryptjs';

export const seedAdmin = async () => {
    try {
        const isAdminExist = await User.findOne({ email: envVars.SUPER_ADMIN_EMAIL })
        if (isAdminExist) {
            console.log("Admin Already Exists!")
            return
        }
        console.log("Trying To Create Admin")

        const hashedPassword = await bcryptjs.hash(envVars.SUPER_ADMIN_PASSWORD, Number(envVars.BCRYPT_SALT_ROUND))
        const authProvider: IAuthProvider = {
            provider: "credentials",
            providerId: envVars.SUPER_ADMIN_EMAIL
        }

        const payload: IUser = {
            name: "admin",
            role: Role.ADMIN,
            email: envVars.SUPER_ADMIN_EMAIL,
            password: hashedPassword,
            isVerified: true,
            riderStatus : RiderStatus.IDLE,
            auths: [authProvider]

        }
        const Admin = await User.create(payload)
        console.log("Admin Created Successfully \n")

        if (envVars.NODE_ENV === "development") {
            console.log(Admin)
        }
    } catch (error) {

        if (envVars.NODE_ENV === "development") {
            console.log(error)
        }
    }
}