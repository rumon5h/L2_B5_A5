import express, { Request, Response } from "express"
import { router } from "./app/routes"
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler"
import notFound from "./app/middlewares/notFound"
import cookieParser from "cookie-parser"
import passport from "passport"
import expressSession from "express-session"
import "./app/config/passport"
import { envVars } from "./app/config/env"
import cors from "cors"

const app = express()

app.use(expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(cookieParser())
app.use(express.json())
app.set("trust proxy", 1) 
app.use(express.urlencoded({ extended: true }))

app.use(cors({
    origin: envVars.FRONTEND_URL,
    credentials: true
}))

// Health check route
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Welcome Ride Booking API"
    })
})

// Registering routes
app.use("/api/v1", router)

// Global middlewares
app.use(globalErrorHandler)
app.use(notFound);

export default app