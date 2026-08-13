import express from 'express';
import csrfRoutes from './csrfRoutes.js';
import authRoutes from './authRoutes.js';
import notesRoutes from './notesRoutes.js';

const router = express.Router();

router.use('/', csrfRoutes);
router.use('/auth', authRoutes);
router.use('/notes', notesRoutes);

export default router;