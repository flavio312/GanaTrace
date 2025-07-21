import e, { Response, Request } from "express";
import { database } from "../configuration/database";

export const getRanches = async (req: Request, res: Response): Promise<any> => {
    const idUsers = req.user?.idUsers;
    try {
        const [ranches]: any = await database.query('SELECT * FROM ranches WHERE idUsers = ?', [idUsers]);
        res.json(ranches);
        console.log("Ganaderías obtenidas correctamente");
    } catch (error) {
        console.error("Error al obtener las ganaderías:", error);
        res.status(500).json({ message: "Error al obtener las ganaderías" });
    }
};

// Obtener una ganadería por ID (solo si pertenece al usuario)
export const getRanchId = async (req: Request, res: Response): Promise<any> => {
    const { idRanches } = req.params;
    const idUsers = req.user?.idUsers;

    try {
        const [rows]: any = await database.query('SELECT * FROM ranches WHERE idRanches = ? AND idUsers = ?', [idRanches, idUsers]);
        if (rows.length === 0) {
            return res.status(403).json({ message: 'No tienes permiso para acceder a esta ganadería' });
        }
        console.log("Ganadería encontrada:", rows[0]);
        res.json(rows[0]);
    } catch (error) {
        console.error("Error al obtener la ganadería:", error);
        res.status(500).json({ message: "Error al obtener la ganadería" });
    }
};

export const createRanch = async (req: Request, res: Response): Promise<any> => {
    const { nameRanch, type, experience, farmSize, ability, description, especialiti } = req.body;
    const idUsers = req.user?.idUsers;
    
    try{
        const [result]: any = await database.query(
            'INSERT INTO ranchs (idRanches, nameRanch, type, experience, farmSize, ability, description, especialiti) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE())',
            [idUsers, nameRanch, type, experience, farmSize, ability, description, especialiti]
        );

        res.status(201).json({
            idRanches: result.insertId,
            idUsers,
            nameRanch,
            type,
            experience,
            farmSize,
            ability,
            description,
            especialiti: new Date().toISOString().split('T')[0]
        });
        console.log("Rancho agregado correctament");
    }catch(error){
        console.log("Error al agregar un nuevo rancho",error);
        res.status(500).json({message:"Error interno"})       
    }
};

export const updateRanch = async (req: Request, res: Response): Promise<any> => {
    const { idRanches } = req.params;
    const { nameRanch, type, experience, farmSize, ability, description, especialiti } = req.body;
    const idUsers = req.user?.idUsers;

    try {
        const [result]: any = await database.query(
            'UPDATE ranches SET nameRanch = ?, type = ?, experience = ?, farmSize = ?, ability = ?, description = ?, especialiti = ? WHERE idRanches = ? AND idUsers = ?',
            [nameRanch, type, experience, farmSize, ability, description, especialiti, idRanches, idUsers]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Ganadería no encontrada o no tienes permiso para actualizarla' });
        }

        res.json({ message: 'Ganadería actualizada correctamente' });
        console.log("Ganadería actualizada correctamente");
    } catch (error) {
        console.error("Error al actualizar la ganadería:", error);
        res.status(500).json({ message: "Error al actualizar la ganadería" });
    }
};

export const deleteRanch = async (req: Request, res: Response): Promise<any> => {
    const { idRanches } = req.params;
    const idUsers = req.user?.idUsers;

    try {
        const [result]: any = await database.query(
            'DELETE FROM ranches WHERE idRanches = ? AND idUsers = ?',
            [idRanches, idUsers]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Ganadería no encontrada o no tienes permiso para eliminarla' });
        }

        res.json({ message: 'Ganadería eliminada correctamente' });
        console.log("Ganadería eliminada correctamente");
    } catch (error) {
        console.error("Error al eliminar la ganadería:", error);
        res.status(500).json({ message: "Error al eliminar la ganadería" });
    }
};