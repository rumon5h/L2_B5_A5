import dotenv from "dotenv";

dotenv.config()

interface EnvConfig {
    PORT: string,
    DB_URL: string,
    NODE_ENV: "development" | "production",
    GOOGLE_CLIENT_SECRET: string,
    GOOGLE_CLIENT_ID: string,
    GOOGLE_CALLBACK_URL: string,
    FRONTEND_URL: string,
    JWT_ACCESS_SECRET?: string,
    JWT_ACCESS_EXPIRES?: string,
    JWT_REFRESH_SECRET?: string,
    EXPRESS_SESSION_SECRET: string,
    JWT_REFRESH_EXPIRES?: string,
    BCRYPT_SALT_ROUND: string,
    SUPER_ADMIN_EMAIL: string,
    SUPER_ADMIN_PASSWORD: string,
    CLOUDINARY: {
        CLOUDINARY_CLOUD_NAME: string,
        CLOUDINARY_API_KEY: string,
        CLOUDINARY_API_SECRET: string,
    },
    EMAIL_SENDER: {
        SMTP_USER: string;
        SMTP_PASS: string;
        SMTP_PORT: string;
        SMTP_HOST: string;
        SMTP_FROM: string;
    };
}

const loadEnvVariables = (): EnvConfig => {
    const requiredEnvVariables: string[] = ["PORT", "DB_URL", "NODE_ENV", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET", "GOOGLE_CALLBACK_URL", "FRONTEND_URL", "JWT_ACCESS_SECRET", "JWT_ACCESS_EXPIRES", "JWT_REFRESH_SECRET", "JWT_REFRESH_EXPIRES",
        "SMTP_USER", "SMTP_PASS", "SMTP_PORT", "SMTP_HOST", "SMTP_FROM", "BCRYPT_SALT_ROUND", "EXPRESS_SESSION_SECRET", "SUPER_ADMIN_EMAIL", "SUPER_ADMIN_PASSWORD"];

    requiredEnvVariables.forEach(key => {
        if (!process.env[key]) {
            throw new Error(`Missing require environment variable ${key}`)
        }
    })

    return {
        PORT: process.env.PORT as string,
        DB_URL: process.env.DB_URL as string,
        NODE_ENV: process.env.NODE_ENV as "development" | "production",
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
        GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,
        FRONTEND_URL: process.env.FRONTEND_URL as string,
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
        JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
        JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES as string,
        EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET as string,
        SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
        SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD as string,
        CLOUDINARY: {
            CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
            CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
            CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
        },
        EMAIL_SENDER: {
            SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER as string,
            SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS as string,
            SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT as string,
            SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST as string,
            SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM as string,
        },
        BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,

    }
}

export const envVars = loadEnvVariables()