import { Response, Request } from 'express';
import { database } from '../configuration/database';

export const getUbications = async (req: Request, res: Response): Promise<any> => {
    const idUsers = req.user?.idUsers;
    try {
        const [ubications]: any = await database.query('SELECT * FROM ubications WHERE idUsers = ?', [idUsers]);
        res.json(ubications);
        console.log("Ubicaciones obtenidas correctamente");
    } catch (error) {
        console.error("Error al obtener las ubicaciones:", error);
        res.status(500).json({ message: "Error al obtener las ubicaciones" });
    }
};

export const getUbicationId = async (req: Request, res: Response): Promise<any> => {
    const { idUbications } = req.params;
    const idUsers = req.user?.idUsers;

    try {
        const [rows]: any = await database.query('SELECT * FROM ubications WHERE idUbications = ? AND idUsers = ?', [idUbications, idUsers]);
        if (rows.length === 0) {
            return res.status(403).json({ message: 'No tienes permiso para acceder a esta ubicación' });
        }
        console.log("Ubicación encontrada:", rows[0]);
        res.json(rows[0]);
    } catch (error) {
        console.error("Error al obtener la ubicación:", error);
        res.status(500).json({ message: "Error al obtener la ubicación" });
    }
};

export const createUbication = async (req: Request, res: Response): Promise<any> => {
    const { state, city, municipality, gps, fullAddres } = req.body;
    const idUsers = req.user?.idUsers;

    try {
        const [result]: any = await database.query(
            'INSERT INTO ubications (idUsers, state, city, municipality, gps, fullAddres) VALUES (?, ?, ?,?, ?, ?)',
            [idUsers, state, city, municipality, gps, fullAddres]
        );

        res.status(201).json({
            idUbications: result.insertId,
            idUsers,
            state, 
            city, 
            municipality, 
            gps, 
            fullAddres
        });
        console.log("Ubicación agregada correctamente");
    } catch (error) {
        console.error("Error al agregar una nueva ubicación:", error);
        res.status(500).json({ message: "Error interno" });
    }
};

export const updateUbication = async (req: Request, res: Response): Promise<any> => {
    const { idUbications } = req.params;
    const { state, city, municipality, gps, fullAddres } = req.body;
    const idUsers = req.user?.idUsers;

    try {
        const [result]: any = await database.query(
            'UPDATE ubications SET state = ?, city = ?, municipality = ?, gps = ?, fullAddres = ? WHERE idUbications = ? AND idUsers = ?',
            [state, city, municipality, gps, fullAddres]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Ubicación no encontrada o no tienes permiso para modificarla" });
        }

        res.json({ message: "Ubicación actualizada correctamente" });
        console.log("Ubicación actualizada correctamente");
    } catch (error) {
        console.error("Error al actualizar la ubicación:", error);
        res.status(500).json({ message: "Error interno" });
    }
};

export const deleteUbication = async (req: Request, res: Response): Promise<any> => {
    const { idUbications } = req.params;
    const idUsers = req.user?.idUsers;

    try {
        const [result]: any = await database.query(
            'DELETE FROM ubications WHERE idUbications = ? AND idUsers = ?',
            [idUbications, idUsers]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Ubicación no encontrada o no tienes permiso para eliminarla" });
        }

        res.json({ message: "Ubicación eliminada correctamente" });
        console.log("Ubicación eliminada correctamente");
    } catch (error) {
        console.error("Error al eliminar la ubicación:", error);
        res.status(500).json({ message: "Error interno" });
    }
};