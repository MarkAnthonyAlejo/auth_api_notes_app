import { Router } from "express";
import { getAllUsers, login, registerUser } from "../controllers/userController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.post('/login', login);
router.post('/registerUser', registerUser);
router.get('/',getAllUsers)

export default router;