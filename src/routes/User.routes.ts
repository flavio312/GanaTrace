import express from 'express';
import { getUsers, getUserId, createUser, updateUser, deleteUser } from '../controllers/User.controller';

const router = express.Router();

router.get('/getUser', getUsers);
router.get('/getUser/:idUsers', getUserId);
router.post('/register', createUser);
router.put('/updateUser/:idUsers', updateUser);
router.delete('/deleteUser/:idUsers', deleteUser);

export default router;