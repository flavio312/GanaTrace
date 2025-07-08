import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import useRoutes from './src/routes/User.routes';
import cowRoutes from './src/routes/Cow.routes';
import loginRoutes from './src/routes/Login.routes';
import { database } from './src/configuration/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/user', useRoutes);
app.use('/management', cowRoutes);
app.use('/auth', loginRoutes);


(async () => {
    try {
    
        await database.getConnection();
        console.log('✅ Conexión a la base de datos exitosa');
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error al conectar a la base de datos:', error);
    }
})();