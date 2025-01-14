"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_config_1 = require("../config/jwt.config");
const authMiddleware = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]; // Extract token from "Authorization: Bearer <token>"
    if (!token) {
        res
            .status(401)
            .json({ success: false, message: 'Authorization token is required.' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, jwt_config_1.jwtConfig.secret);
        req.user = decoded; // Attach user info to the request object
        next();
    }
    catch (error) {
        res
            .status(401)
            .json({ success: false, message: 'Invalid or expired token.' });
    }
};
exports.authMiddleware = authMiddleware;
