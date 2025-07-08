import {Response, Request} from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { database } from '../configuration/database';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { sendEmail } from '../services/email.service';

dotenv.config();

export const login = async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;

    try {
        const [rows] = await database.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = (rows as any[])[0];

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const secretKey = process.env.JWT_SECRET || '';
        if (!secretKey) {
            return res.status(500).json({ message: "Clave secreta JWT no configurada" });
        }

        const token = jwt.sign({ idUsers: user.idUsers, email: user.email, rol: user.rol }, secretKey, {
            expiresIn: '1h'
        });
        
        console.log("Usuario autenticado correctamente:", { idUsers: user.idUsers, name: user.name, email: user.email, rol: user.rol });
        res.json({ idUsers: user.idUsers, name: user.name, email: user.email, rol: user.rol, token });
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        res.status(500).json({ message: "Error al iniciar sesión" });
    }   
};

export const recupContraseña = async (req: Request, res: Response): Promise<any> => {
    const { email } = req.body;

    try {
        if (!email || !email.trim()) {
            return res.status(400).json({ message: 'El email es requerido' });
        }

        const [rows] = await database.query('SELECT * FROM users WHERE email = ?', [email]);
        const users = (rows as any[])[0];

        if (!users) {
            return res.status(200).json({ message: 'Si el email existe, se enviará un correo de recuperación' });
        }
        
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const tokenExpiry = new Date(Date.now() + 3600000); // 1 hora

        await database.query(
            'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE idUsers = ?',
            [hashedToken, tokenExpiry, users.idUsers]
        );

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;


        // Configurar el correo con HTML
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: users.email,
            subject: 'Recuperación de contraseña',
            html: `
                <h2>Recuperación de contraseña</h2>
                <p>Hola ${users.name},</p>
                <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
                <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Restablecer contraseña</a>
                <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
                <p>El enlace expirará en 1 hora.</p>
                <p>Saludos,<br>El equipo de soporte</p>
            `,
            text: `Hola ${users.name}, has solicitado restablecer tu contraseña. Visita el siguiente enlace: ${resetUrl}. El enlace expirará en 1 hora.`
        };
        
        await sendEmail(mailOptions);

        res.json({ message: 'Correo de recuperación enviado exitosamente' });
    } catch (error) {
        console.error("Error al recuperar contraseña:", error);
        res.status(500).json({ message: "Error al procesar la solicitud" });
    }
};

export const verificarToken = async (req: Request, res: Response): Promise<any> => {
    const { token } = req.query;

    try {
        if (!token || typeof token !== 'string') {
            return res.status(400).json({ message: 'Token no válido' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const [rows] = await database.query(
            'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
            [hashedToken]
        );
        const user = (rows as any[])[0];

        if (!user) {
            return res.status(400).json({ message: 'Token inválido o expirado' });
        }

        res.json({ message: 'Token válido', valid: true });
    } catch (error) {
        console.error("Error al verificar token:", error);
        res.status(500).json({ message: "Error al verificar token" });
    }
};

export const restablecerContraseña = async (req: Request, res: Response): Promise<any> => {
    const { token, newPassword } = req.body;

    try {
        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token y nueva contraseña son requeridos' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        // Verificar token
        const [rows] = await database.query(
            'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
            [hashedToken]
        );
        const user = (rows as any[])[0];

        if (!user) {
            return res.status(400).json({ message: 'Token inválido o expirado' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        await database.query(
            'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE idUsers = ?',
            [hashedPassword, user.idUsers]
        );

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || '',
                pass: process.env.EMAIL_PASSWORD || '',
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Contraseña restablecida exitosamente',
            html: `
                <h2>Contraseña restablecida</h2>
                <p>Hola ${user.name},</p>
                <p>Tu contraseña ha sido restablecida exitosamente.</p>
                <p>Si no realizaste este cambio, contacta inmediatamente con soporte.</p>
                <p>Saludos,<br>El equipo de soporte</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: 'Contraseña restablecida exitosamente' });
    } catch (error) {
        console.error("Error al restablecer contraseña:", error);
        res.status(500).json({ message: "Error al restablecer contraseña" });
    }
};

export const solicitarCambioContraseña = async (req: Request, res: Response): Promise<any> => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.idUsers;

    try {
        if (!userId) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Contraseña actual y nueva son requeridas' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
        }

        // Verificar contraseña actual
        const [rows] = await database.query('SELECT * FROM users WHERE idUsers = ?', [userId]);
        const user = (rows as any[])[0];

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({ message: 'Contraseña actual incorrecta' });
        }

        // Encriptar nueva contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Actualizar contraseña
        await database.query(
            'UPDATE users SET password = ? WHERE idUsers = ?',
            [hashedPassword, userId]
        );

        res.json({ message: 'Contraseña cambiada exitosamente' });
    } catch (error) {
        console.error("Error al cambiar contraseña:", error);
        res.status(500).json({ message: "Error al cambiar contraseña" });
    }
};