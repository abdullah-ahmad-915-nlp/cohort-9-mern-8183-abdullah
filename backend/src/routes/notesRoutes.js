import express from 'express';
import { createNote, getNotes, getNote, updateNote, deleteNote } from '../controllers/notesController.js';
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router();

router.post('/', authMiddleware, createNote);
router.get('/', authMiddleware, getNotes);
router.get('/:id', authMiddleware, getNote);
router.put('/:id', authMiddleware, updateNote);
router.delete('/:id', authMiddleware, deleteNote);

export default router;