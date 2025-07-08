import { Response, Request } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { database } from '../configuration/database';

export const getUsers = async (req: Request, res: Response): Promise<any> => {
    try{
        const [rows] = await database.query('SELECT * FROM users');
        res.json(rows);
        console.log("Usuarios obtenidos correctamente");
    } catch (error) {
        console.error("Error al obtener los usuarios:", error);
        res.status(500).json({ message: "Error al obtener los usuarios" });
    }
};

// Obtener usuario por ID
export const getUserId = async (req: Request, res: Response) => {
    try{
        const [rows] = await database.query('SELECT * FROM users WHERE idUsers = ?', [req.params.idUsers]);
        const user = (rows as any[])[0];
        user ? res.json(user) : res.status(404).json({ message: 'User not found' });
        console.log("Usuario encontrado:", user);
    } catch (error) {
        console.error("Error al obtener el usuario:", error);
        res.status(500).json({ message: "Error al obtener el usuario" });
    }
};

// Crear usuario
export const createUser = async (req: Request, res: Response): Promise<any> => {
    const { name, email, password, rol } = req.body;

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const secretKey = process.env.JWT_SECRET || '';
        if (!secretKey) {
            return res.status(500).json({ message: "Clave secreta JWT no configurada" });
        }

        const [result]: any = await database.query(
            'INSERT INTO users (name, email, password, rol) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, rol]
        );

        const token = jwt.sign({ idUsers: result.insertId, email, rol }, secretKey, {
            expiresIn: '1h'
        });
        console.log("Usuario creado correctamente:", { idUsers: result.insertId, name, email, rol });
        res.status(201).json({ idUsers: result.insertId, name, email, rol, token });
    } catch (error) {
        console.error("Error al crear el usuario:", error);
        res.status(500).json({ message: "Error al crear el usuario" });
    }
};

// Actualizar usuario
export const updateUser = async (req: Request, res: Response): Promise<any> => {
    const { name, email, password, rol } = req.body;
    const { idUsers } = req.params;

    try {
        let query = 'UPDATE users SET name = ?, email = ?, rol = ?';
        const params: any[] = [name, email, rol];

        if (password) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            query += ', password = ?';
            params.push(hashedPassword);
        }

        query += ' WHERE idUsers = ?';
        params.push(idUsers);

        const [result]: any = await database.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log("Usuario actualizado correctamente:", { idUsers, name, email, rol });
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error("Error al actualizar el usuario:", error);
        res.status(500).json({ message: "Error al actualizar el usuario" });
    }
};

// Eliminar usuario
export const deleteUser = async (req: Request, res: Response): Promise<any> => {
    const { idUsers } = req.params;

    try {
        const [result]: any = await database.query('DELETE FROM users WHERE idUsers = ?', [idUsers]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log("Usuario eliminado correctamente:", { idUsers });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error("Error al eliminar el usuario:", error);
        res.status(500).json({ message: "Error al eliminar el usuario" });
    }
};
