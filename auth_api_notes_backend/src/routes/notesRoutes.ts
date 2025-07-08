import { Router } from "express";
import { createNotes, deleteNote, getNotes, updateNotes } from "../controllers/notesController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.get('/getNotes', authenticateToken, getNotes);
router.post('/createNotes', authenticateToken, createNotes);
router.put('/update/:id', authenticateToken, updateNotes);
router.delete('/delete/:id', authenticateToken, deleteNote);

export default router;