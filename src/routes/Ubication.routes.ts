import express from 'express';
import { getUbications, getUbicationId, createUbication, updateUbication, deleteUbication } from '../controllers/Ubication.controller';

const router = express.Router();

router.get('/ubications', getUbications);
router.get('/ubications/:idUbications', getUbicationId);
router.post('/ubications', createUbication);
router.put('/ubications/:idUbications', updateUbication);
router.delete('/ubications/:idUbications', deleteUbication);

export default router;