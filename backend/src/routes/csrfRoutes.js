import express from 'express';
import { getCsrfToken } from '../controllers/csrfController.js';

const router = express.Router();

router.get('/csrf-token', getCsrfToken);

export default router;