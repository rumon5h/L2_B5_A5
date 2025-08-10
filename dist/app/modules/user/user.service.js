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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userServices = exports.updateUserStatus = void 0;
const appErrors_1 = __importDefault(require("../..//errorHelpers/appErrors"));
const user_interface_1 = require("./user.interface");
const user_model_1 = require("./user.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_constant_1 = require("./user.constant");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
// Function to create a new user
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload, rest = __rest(payload, ["email", "password"]);
    const isUserExist = yield user_model_1.User.findOne({ email });
    if (isUserExist) {
        throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, "User Already Exists");
    }
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    const authProvider = { provider: "credentials", providerId: email };
    const user = yield user_model_1.User.create(Object.assign({ email, password: hashedPassword, auths: [authProvider] }, rest));
    return user;
});
// Function to get all users with pagination, filtering, and sorting
// It uses a QueryBuilder to build the query based on the provided filters and options
const getAllUsers = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(user_model_1.User.find(), query);
    const usersData = queryBuilder
        .filter()
        .search(user_constant_1.userSearchableFields)
        .sort()
        .fields()
        .paginate();
    const [data] = yield Promise.all([
        usersData.build(),
        queryBuilder.getMeta()
    ]);
    return {
        data,
        // meta
    };
});
// Function to update a user by ID
const updateUser = (userId, payload, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const ifUserExist = yield user_model_1.User.findById(userId);
    // new
    if (decodedToken.role === user_interface_1.Role.RIDER || decodedToken.role === user_interface_1.Role.DRIVER) {
        if (userId !== decodedToken.userId) {
            throw new appErrors_1.default(http_status_codes_1.default.FORBIDDEN, "You are unauthorized to update another user's profile");
        }
    }
    if (!ifUserExist) {
        throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "User not Found");
    }
    if (payload.role) {
        if (decodedToken.role === user_interface_1.Role.RIDER || decodedToken.role === user_interface_1.Role.DRIVER) {
            throw new appErrors_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized");
        }
    }
    if (payload.isBlocked || payload.isVerified) {
        if (decodedToken.role === user_interface_1.Role.RIDER || decodedToken.role === user_interface_1.Role.DRIVER) {
            throw new appErrors_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized");
        }
    }
    const newUpdatedUser = yield user_model_1.User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true });
    return newUpdatedUser;
});
// Function to get a single user by ID
const getSingleUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(id).select("-password");
    return {
        data: user
    };
});
const getMe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).select("-password");
    return {
        data: user
    };
});
// Function to update the status of a user (block/unblock)
const updateUserStatus = (userId, payload, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const ifUserExist = yield user_model_1.User.findById(userId);
    if (!ifUserExist) {
        throw new appErrors_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    if (decodedToken.userId.toString() === ifUserExist._id.toString()) {
        throw new appErrors_1.default(http_status_codes_1.default.FORBIDDEN, "You cannot change your own block status");
    }
    if (payload.isBlocked === ifUserExist.isBlocked) {
        throw new appErrors_1.default(http_status_codes_1.default.BAD_REQUEST, `User is already ${payload.isBlocked ? "blocked" : "unblocked"}`);
    }
    const updatedUser = yield user_model_1.User.findByIdAndUpdate(userId, payload, {
        new: true,
        runValidators: true,
    });
    return updatedUser;
});
exports.updateUserStatus = updateUserStatus;
exports.userServices = {
    createUser,
    getAllUsers,
    updateUser,
    getSingleUser,
    getMe,
    updateUserStatus: exports.updateUserStatus
};
