"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const musicbox_controller_1 = require("../controllers/musicbox.controller");
const router = (0, express_1.Router)();
const musicBoxController = new musicbox_controller_1.MusicBoxController();
// Define music box routes
router.get('/suggestions', (req, res) => musicBoxController.getSuggestions(req, res));
router.post('/suggestions', (req, res) => musicBoxController.addSuggestion(req, res));
router.post('/suggestions/:id/vote', (req, res) => musicBoxController.voteSuggestion(req, res));
router.delete('/suggestions/:id', (req, res) => musicBoxController.removeSuggestion(req, res));
exports.default = router;
