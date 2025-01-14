"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateIdParam = exports.validateSuggestion = void 0;
const express_validator_1 = require("express-validator");
exports.validateSuggestion = [
    (0, express_validator_1.body)('title').isString().withMessage('Title must be a string.'),
    (0, express_validator_1.body)('artist').isString().withMessage('Artist must be a string.'),
];
exports.validateIdParam = [
    (0, express_validator_1.param)('id').isUUID().withMessage('ID must be a valid UUID.'),
];
