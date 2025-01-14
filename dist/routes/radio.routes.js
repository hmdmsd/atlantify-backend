"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const radio_controller_1 = require("../controllers/radio.controller");
const router = (0, express_1.Router)();
const radioController = new radio_controller_1.RadioController();
// Define radio routes
router.get('/queue', (req, res) => radioController.getQueue(req, res));
router.post('/queue', (req, res) => radioController.addToQueue(req, res));
router.delete('/queue/:id', (req, res) => radioController.removeFromQueue(req, res));
router.get('/current', (req, res) => radioController.getCurrent(req, res));
router.get('/next', (req, res) => radioController.getNext(req, res));
exports.default = router;
