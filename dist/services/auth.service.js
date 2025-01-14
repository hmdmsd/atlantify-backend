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
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const jwt_config_1 = require("../config/jwt.config");
class AuthService {
    /**
     * Authenticates a user by validating their credentials and returns a JWT.
     * @param username - The user's username.
     * @param password - The user's password.
     * @returns The JWT if successful, or null if authentication fails.
     */
    login(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.UserModel.findOne({ where: { username } });
            if (!user)
                return null;
            const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordValid)
                return null;
            return jsonwebtoken_1.default.sign({ sub: user.id, username: user.username, role: user.role }, jwt_config_1.jwtConfig.secret, {
                expiresIn: jwt_config_1.jwtConfig.expiresIn,
            });
        });
    }
    /**
     * Registers a new user by hashing their password and saving their details.
     * @param username - The desired username.
     * @param email - The user's email.
     * @param password - The user's password.
     * @returns The created user, or null if the user already exists.
     */
    register(username, email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield user_model_1.UserModel.findOne({ where: { username } });
            if (existingUser)
                return null;
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            return user_model_1.UserModel.create({
                username,
                email,
                password: hashedPassword,
                role: 'user', // Default role
            });
        });
    }
    /**
     * Refreshes a JWT token by validating the old token and generating a new one.
     * @param token - The old token to refresh.
     * @returns A new token if the old one is valid, or null if invalid.
     */
    refreshToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, jwt_config_1.jwtConfig.secret);
                return jsonwebtoken_1.default.sign({ sub: decoded.sub, username: decoded.username, role: decoded.role }, jwt_config_1.jwtConfig.secret, { expiresIn: jwt_config_1.jwtConfig.expiresIn });
            }
            catch (_a) {
                return null;
            }
        });
    }
}
exports.AuthService = AuthService;
