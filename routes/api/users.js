import express from 'express';
import {signup, login, logout, currentUser, updateAvatar} from "../../models/users.js";
import authMiddleware from '../../routes/middleware/authMiddleware.js'
import multer from 'multer';
import path from "path";

import { nanoid } from 'nanoid';


const tempDir = path.join(process.cwd(), "tmp")
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${nanoid()}${file.originalname}`);
  },
  limits: {
    fileSize: 5242880,
  },
});

const upload = multer({
  storage: storage,
});

const router = express.Router()

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', authMiddleware, logout);
router.get('/current', authMiddleware, currentUser); 
router.patch('/avatars',authMiddleware, upload.single('avatar'),
updateAvatar);

export default router;
