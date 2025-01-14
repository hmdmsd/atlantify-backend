"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const musicbox_routes_1 = __importDefault(require("./musicbox.routes"));
const radio_routes_1 = __importDefault(require("./radio.routes"));
const songs_routes_1 = __importDefault(require("./songs.routes"));
const router = (0, express_1.Router)();
// Combine all routes
router.use('/auth', auth_routes_1.default);
router.use('/musicbox', musicbox_routes_1.default);
router.use('/radio', radio_routes_1.default);
router.use('/songs', songs_routes_1.default);
exports.default = router;
