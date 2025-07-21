import { Request, Response } from 'express';
import { database } from '../configuration/database';

// Obtener todas las vacas del usuario autenticado
export const getCows = async (req: Request, res: Response): Promise<any> => {
    const idUsers = req.user?.idUsers;
    try {
        const [cows]: any = await database.query('SELECT * FROM cows WHERE idUsers = ?', [idUsers]);
        res.json(cows);
        console.log("Vacas obtenidas correctamente");
    } catch (error) {
        console.error("Error al obtener las vacas:", error);
        res.status(500).json({ message: "Error al obtener las vacas" });
    }
};

// Obtener una vaca por ID (solo si pertenece al usuario)
export const getCowId = async (req: Request, res: Response): Promise<any> => {
    const { idCows } = req.params;
    const idUsers = req.user?.idUsers;

    try {
        const [rows]: any = await database.query('SELECT * FROM cows WHERE idCows = ? AND idUsers = ?', [idCows, idUsers]);
        if (rows.length === 0) {
            return res.status(403).json({ message: 'No tienes permiso para acceder a esta vaca' });
        }
        console.log("Vaca encontrada:", rows[0]);
        console.log("ID de la vaca:", idCows);
        res.json(rows[0]);
    } catch (error) {
        console.error("Error al obtener la vaca:", error);
        res.status(500).json({ message: "Error al obtener la vaca" });
    }
};

// Crear una nueva vaca asociada al usuario autenticado
export const createCow = async (req: Request, res: Response): Promise<any> => {
    const { race, age, weight, price, vaccination, description, image, dateRegister } = req.body;
    const idUsers = req.user?.idUsers;

    try {
        const [result]: any = await database.query(
            'INSERT INTO cows (idUsers, race, age, weight, price, vaccination, description, image, dateRegister) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())',
            [idUsers,race, age, weight, price, vaccination, description, image, dateRegister]
        );

        res.status(201).json({
            idCows: result.insertId,
            idUsers,
            race, 
            age, 
            weight, 
            price, 
            vaccination, 
            description, 
            image, 
            dateRegister: new Date().toISOString().split('T')[0]
        });
        console.log("Vaca creada correctamente");
    } catch (error) {
        console.error("Error al crear la vaca:", error);
        res.status(500).json({ message: "Error al crear la vaca" });
    }
};

// Actualizar una vaca (solo si pertenece al usuario)
export const updateCow = async (req: Request, res: Response): Promise<any> => {
    const { idCows } = req.params;
    const {race, age, weight, price, vaccination, description, image, dateRegister} = req.body;
    const idUsers = req.user?.idUsers;

    try {
        const [rows]: any = await database.query('SELECT * FROM cows WHERE idCows = ? AND idUsers = ?', [idCows, idUsers]);
        if (rows.length === 0) {
            return res.status(403).json({ message: 'No tienes permiso para modificar esta vaca' });
        }

        const [result]: any = await database.query(
            'UPDATE cows SET race = ?, age = ?, weight = ?, price = ?, vaccination = ?, description = ?, image = ?, dateRegister = ? WHERE idCows = ?',
            [race, age, weight, price, vaccination, description, image, dateRegister, idCows]
        );
        console.log("Vaca actualizada correctamente");
        res.json({ message: 'Vaca actualizada correctamente' });
    } catch (error) {
        console.error("Error al actualizar la vaca:", error);
        res.status(500).json({ message: "Error al actualizar la vaca" });
    }
};

// Eliminar una vaca (solo si pertenece al usuario)
export const deleteCow = async (req: Request, res: Response): Promise<any> => {
    const { idCows } = req.params;
    const idUsers = req.user?.idUsers;

    try {
        const [rows]: any = await database.query('SELECT * FROM cows WHERE idCows = ? AND idUsers = ?', [idCows, idUsers]);
        if (rows.length === 0) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar esta vaca' });
        }
        console.log("Vaca encontrada para eliminar:", rows[0]);
        console.log("ID de la vaca a eliminar:", idCows);

        const [result]: any = await database.query('DELETE FROM cows WHERE idCows = ?', [idCows]);

        res.json({ message: 'Vaca eliminada correctamente' });
    } catch (error) {
        console.error("Error al eliminar la vaca:", error);
        res.status(500).json({ message: "Error al eliminar la vaca" });
    }
};
