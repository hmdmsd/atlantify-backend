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
exports.UserService = void 0;
const user_model_1 = require("../models/user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserService {
    /**
     * Retrieves a user by their ID.
     * @param userId - The ID of the user.
     * @returns The user or null if not found.
     */
    getUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return user_model_1.UserModel.findByPk(userId);
        });
    }
    /**
     * Retrieves a user by their username.
     * @param username - The username of the user.
     * @returns The user or null if not found.
     */
    getUserByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            return user_model_1.UserModel.findOne({ where: { username } });
        });
    }
    /**
     * Updates user information.
     * @param userId - The ID of the user.
     * @param updates - The fields to update (partial user object).
     * @returns The updated user or null if the user does not exist.
     */
    updateUser(userId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.UserModel.findByPk(userId);
            if (!user)
                return null;
            if (updates.password) {
                updates.password = yield bcryptjs_1.default.hash(updates.password, 10);
            }
            Object.assign(user, updates);
            yield user.save();
            return user;
        });
    }
    /**
     * Deletes a user by their ID.
     * @param userId - The ID of the user.
     * @returns True if the user was deleted, false otherwise.
     */
    deleteUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.UserModel.findByPk(userId);
            if (!user)
                return false;
            yield user.destroy();
            return true;
        });
    }
    /**
     * Retrieves all users.
     * @returns A list of all users.
     */
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return user_model_1.UserModel.findAll();
        });
    }
    /**
     * Creates a new user.
     * @param username - The username of the new user.
     * @param email - The email of the new user.
     * @param password - The password of the new user.
     * @param role - The role of the new user (default: 'user').
     * @returns The newly created user.
     */
    createUser(_a) {
        return __awaiter(this, arguments, void 0, function* ({ username, email, password, role = 'user', }) {
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            return user_model_1.UserModel.create({
                username,
                email,
                password: hashedPassword,
                role,
            });
        });
    }
    /**
     * Verifies a user's password.
     * @param userId - The ID of the user.
     * @param password - The password to verify.
     * @returns True if the password is valid, false otherwise.
     */
    verifyPassword(userId, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.UserModel.findByPk(userId);
            if (!user)
                return false;
            return bcryptjs_1.default.compare(password, user.password);
        });
    }
}
exports.UserService = UserService;
