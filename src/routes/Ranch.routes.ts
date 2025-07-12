import express from 'express';
import { getUbications, getUbicationId, createUbication, updateUbication, deleteUbication } from '../controllers/Ubication.controller';

const router = express.Router();

router.get('/ranches', getUbications);
router.get('/ranches/:idRanches', getUbicationId);
router.post('/ranches', createUbication);
router.put('/ranches/:idRanches', updateUbication);
router.delete('/ranches/:idRanches', deleteUbication);

export default router;