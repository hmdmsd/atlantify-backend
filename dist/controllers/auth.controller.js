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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const authService = new auth_service_1.AuthService();
class AuthController {
    /**
     * Handles user login.
     * Validates the credentials and returns a JWT if successful.
     */
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, password } = req.body;
                if (!username || !password) {
                    res.status(400).json({
                        success: false,
                        message: 'Username and password are required.',
                    });
                    return;
                }
                const token = yield authService.login(username, password);
                if (!token) {
                    res
                        .status(401)
                        .json({ success: false, message: 'Invalid credentials.' });
                    return;
                }
                res.status(200).json({ success: true, token });
            }
            catch (error) {
                console.error('Login error:', error);
                res
                    .status(500)
                    .json({ success: false, message: 'Internal server error.' });
            }
        });
    }
    /**
     * Handles user registration.
     * Creates a new user account and returns a success message.
     */
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, email, password } = req.body;
                if (!username || !email || !password) {
                    res.status(400).json({
                        success: false,
                        message: 'Username, email, and password are required.',
                    });
                    return;
                }
                const user = yield authService.register(username, email, password);
                if (!user) {
                    res
                        .status(400)
                        .json({ success: false, message: 'User already exists.' });
                    return;
                }
                res
                    .status(201)
                    .json({ success: true, message: 'User registered successfully.' });
            }
            catch (error) {
                console.error('Registration error:', error);
                res
                    .status(500)
                    .json({ success: false, message: 'Internal server error.' });
            }
        });
    }
    /**
     * Refreshes an expired JWT token and provides a new one.
     */
    refresh(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token } = req.body;
                if (!token) {
                    res.status(400).json({ success: false, message: 'Token is required.' });
                    return;
                }
                const newToken = yield authService.refreshToken(token);
                if (!newToken) {
                    res
                        .status(401)
                        .json({ success: false, message: 'Invalid or expired token.' });
                    return;
                }
                res.status(200).json({ success: true, token: newToken });
            }
            catch (error) {
                console.error('Token refresh error:', error);
                res
                    .status(500)
                    .json({ success: false, message: 'Internal server error.' });
            }
        });
    }
    /**
     * Handles user logout.
     * In stateless JWT systems, logout is client-side only.
     */
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Invalidate token logic (optional if using token blacklists)
                res
                    .status(200)
                    .json({ success: true, message: 'Logged out successfully.' });
            }
            catch (error) {
                console.error('Logout error:', error);
                res
                    .status(500)
                    .json({ success: false, message: 'Internal server error.' });
            }
        });
    }
}
exports.AuthController = AuthController;
