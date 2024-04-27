import express from 'express';
import {signup, login, logout, currentUser} from "../../models/users.js";
import authMiddleware from '../../routes/middleware/authMiddleware.js'

const router = express.Router()

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', authMiddleware, logout);
router.get('/current', authMiddleware, currentUser); 

export default router;
