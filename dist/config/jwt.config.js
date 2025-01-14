"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConfig = void 0;
exports.jwtConfig = {
    secret: process.env.JWT_SECRET || 'default_secret', // Replace with a secure secret
    expiresIn: '24h', // Token expiration time
    algorithm: 'HS256', // Hashing algorithm
};
