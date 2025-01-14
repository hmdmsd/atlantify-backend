import { Router } from 'express';
import { RadioController } from '../controllers/radio.controller';

const router = Router();
const radioController = new RadioController();

// Define radio routes
router.get('/queue', (req, res) => radioController.getQueue(req, res));
router.post('/queue', (req, res) => radioController.addToQueue(req, res));
router.delete('/queue/:id', (req, res) =>
  radioController.removeFromQueue(req, res)
);
router.get('/current', (req, res) => radioController.getCurrent(req, res));
router.get('/next', (req, res) => radioController.getNext(req, res));

export default router;
