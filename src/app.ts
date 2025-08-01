import cors from "cors";
import express, { Request, Response } from "express";

const app = express()

app.use(express.json())
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true }))
app.use(cors())


app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Welcome Ride Booking API"
    })
})

export default app