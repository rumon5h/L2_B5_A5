"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const appErrors_1 = __importDefault(require("../errorHelpers/appErrors"));
const transporter = nodemailer_1.default.createTransport({
    secure: true,
    auth: {
        user: env_1.envVars.EMAIL_SENDER.SMTP_USER,
        pass: env_1.envVars.EMAIL_SENDER.SMTP_PASS,
    },
    port: Number(env_1.envVars.EMAIL_SENDER.SMTP_PORT),
    host: env_1.envVars.EMAIL_SENDER.SMTP_HOST,
});
const sendEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ to, subject, attachments, templateName, templateData }) {
    try {
        const templatePath = path_1.default.join(__dirname, `templates/${templateName}.ejs`);
        console.log(templatePath);
        const html = yield ejs_1.default.renderFile(templatePath, templateData);
        const info = yield transporter.sendMail({
            from: env_1.envVars.EMAIL_SENDER.SMTP_FROM,
            to: to,
            subject: subject,
            html: html,
            attachments: attachments === null || attachments === void 0 ? void 0 : attachments.map(attachment => ({
                filename: attachment.filename,
                content: attachment.content,
                contentType: attachment.contentType
            }))
        });
        console.log(` Email sent to ${to}: ${info.messageId}`);
    }
    catch (error) {
        console.log("email sending error", error.message);
        throw new appErrors_1.default(401, "Email error");
    }
});
exports.sendEmail = sendEmail;
