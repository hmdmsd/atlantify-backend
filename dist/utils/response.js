"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data, message = 'Success') => {
    res.status(200).json({ success: true, message, data });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, error, statusCode = 500) => {
    const message = error.message || 'Internal server error.';
    res.status(statusCode).json({ success: false, message });
};
exports.sendError = sendError;
