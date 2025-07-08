import express from 'express';
import { getCows, getCowId, createCow, updateCow, deleteCow } from '../controllers/Cow.controller';


const router = express.Router();

router.get('/cow', getCows);
router.get('/cow/:idCows', getCowId);
router.post('/cow', createCow);
router.put('/cow/:idCows', updateCow);
router.delete('/cow/:idCows', deleteCow);

export default router;
