"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.envVars = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const loadEnvVariables = () => {
    const requiredEnvVariables = ["PORT", "DB_URL", "NODE_ENV", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET", "GOOGLE_CALLBACK_URL", "FRONTEND_URL", "JWT_ACCESS_SECRET", "JWT_ACCESS_EXPIRES", "JWT_REFRESH_SECRET", "JWT_REFRESH_EXPIRES",
        "SMTP_USER", "SMTP_PASS", "SMTP_PORT", "SMTP_HOST", "SMTP_FROM", "BCRYPT_SALT_ROUND", "EXPRESS_SESSION_SECRET", "SUPER_ADMIN_EMAIL", "SUPER_ADMIN_PASSWORD"];
    requiredEnvVariables.forEach(key => {
        if (!process.env[key]) {
            throw new Error(`Missing require environment variable ${key}`);
        }
    });
    return {
        PORT: process.env.PORT,
        DB_URL: process.env.DB_URL,
        NODE_ENV: process.env.NODE_ENV,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
        FRONTEND_URL: process.env.FRONTEND_URL,
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
        JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
        JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES,
        EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET,
        SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
        SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD,
        CLOUDINARY: {
            CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
            CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
            CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
        },
        EMAIL_SENDER: {
            SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER,
            SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS,
            SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT,
            SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST,
            SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM,
        },
        BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND,
    };
};
exports.envVars = loadEnvVariables();
