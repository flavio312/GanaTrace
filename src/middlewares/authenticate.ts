import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { database } from '../configuration/database';
import dotenv from 'dotenv'

dotenv.config();

declare global {
    namespace Express {
        interface Request {
            user?: {
                idUsers: number;
                email: string;
                rol: string;
                name?: string;
            };
        }
    }
}

interface JwtPayload {
    idUsers: number;
    email: string;
    rol: string;
    iat?: number;
    exp?: number;
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        // Obtener el token del header Authorization
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ 
                message: 'Token de acceso requerido',
                code: 'TOKEN_MISSING' 
            });
        }

        // Verificar que la clave secreta esté configurada
        const secretKey = process.env.JWT_SECRET;
        if (!secretKey) {
            console.error('JWT_SECRET no está configurado');
            return res.status(500).json({ 
                message: 'Error de configuración del servidor',
                code: 'SERVER_CONFIG_ERROR' 
            });
        }

        // Verificar y decodificar el token
        const decoded = jwt.verify(token, secretKey) as JwtPayload;

        // Verificar que el usuario aún existe en la base de datos
        const [rows] = await database.query(
            'SELECT idUsers, email, rol, name FROM users WHERE idUsers = ?', 
            [decoded.idUsers]
        );
        const user = (rows as any[])[0];

        if (!user) {
            return res.status(401).json({ 
                message: 'Usuario no encontrado',
                code: 'USER_NOT_FOUND' 
            });
        }

        // Agregar información del usuario al request
        req.user = {
            idUsers: user.idUsers,
            email: user.email,
            rol: user.rol,
            name: user.name
        };

        next();
    } catch (error) {
        console.error('Error en autenticación:', error);
        
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ 
                message: 'Token expirado',
                code: 'TOKEN_EXPIRED' 
            });
        }
        
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ 
                message: 'Token inválido',
                code: 'TOKEN_INVALID' 
            });
        }

        return res.status(500).json({ 
            message: 'Error interno del servidor',
            code: 'INTERNAL_ERROR' 
        });
    }
};

// Middleware para verificar roles específicos
export const requireRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): any => {
        if (!req.user) {
            return res.status(401).json({ 
                message: 'Usuario no autenticado',
                code: 'USER_NOT_AUTHENTICATED' 
            });
        }

        if (!allowedRoles.includes(req.user.rol)) {
            return res.status(403).json({ 
                message: 'No tienes permisos suficientes',
                code: 'INSUFFICIENT_PERMISSIONS',
                requiredRoles: allowedRoles,
                userRole: req.user.rol
            });
        }

        next();
    };
};

// Middleware para verificar que el usuario sea admin
export const requireAdmin = requireRole(['admin']);

// Middleware para verificar que el usuario sea admin o moderador
export const requireModerator = requireRole(['admin', 'moderador']);

// Middleware para verificar que el usuario acceda solo a sus propios datos
export const requireOwnershipOrAdmin = (req: Request, res: Response, next: NextFunction): any => {
    if (!req.user) {
        return res.status(401).json({ 
            message: 'Usuario no autenticado',
            code: 'USER_NOT_AUTHENTICATED' 
        });
    }

    // Obtener el ID del usuario de los parámetros de la URL
    const targetUserId = parseInt(req.params.userId || req.params.id);
    
    // Permitir si es admin o si es el mismo usuario
    if (req.user.rol === 'admin' || req.user.idUsers === targetUserId) {
        next();
    } else {
        return res.status(403).json({ 
            message: 'Solo puedes acceder a tu propia información',
            code: 'OWNERSHIP_REQUIRED' 
        });
    }
};

// Middleware opcional - no falla si no hay token
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return next(); // Continuar sin autenticación
        }

        const secretKey = process.env.JWT_SECRET || '';
        if (!secretKey) {
            return next(); // Continuar sin autenticación
        }

        const decoded = jwt.verify(token, secretKey) as JwtPayload;
        
        // Verificar que el usuario existe
        const [rows] = await database.query(
            'SELECT idUsers, email, rol, name FROM users WHERE idUsers = ?', 
            [decoded.idUsers]
        );
        const user = (rows as any[])[0];

        if (user) {
            req.user = {
                idUsers: user.idUsers,
                email: user.email,
                rol: user.rol,
                name: user.name
            };
        }

        next();
    } catch (error) {
        // Si hay error, simplemente continuar sin autenticación
        next();
    }
};

// Middleware para validar el formato del token sin verificar su validez
export const validateTokenFormat = (req: Request, res: Response, next: NextFunction): any => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            message: 'Formato de token inválido. Use: Bearer <token>',
            code: 'INVALID_TOKEN_FORMAT' 
        });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token || token.length === 0) {
        return res.status(401).json({ 
            message: 'Token vacío',
            code: 'EMPTY_TOKEN' 
        });
    }

    next();
};

// Middleware para refrescar token automáticamente
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        if (!req.user) {
            return next();
        }

        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return next();
        }

        const secretKey = process.env.JWT_SECRET || '';
        if (!secretKey) {
            return next();
        }

        const decoded = jwt.decode(token) as JwtPayload;
        
        if (!decoded || !decoded.exp) {
            return next();
        }

        // Si el token expira en menos de 15 minutos, generar uno nuevo
        const timeUntilExpiry = decoded.exp * 1000 - Date.now();
        const fifteenMinutes = 15 * 60 * 1000;

        if (timeUntilExpiry < fifteenMinutes && timeUntilExpiry > 0) {
            const newToken = jwt.sign(
                { 
                    idUsers: req.user.idUsers, 
                    email: req.user.email, 
                    rol: req.user.rol 
                }, 
                secretKey, 
                { expiresIn: '1h' }
            );

            // Agregar el nuevo token al header de respuesta
            res.setHeader('New-Token', newToken);
        }

        next();
    } catch (error) {
        console.error('Error en refresh token:', error);
        next();
    }
};

// Función helper para generar tokens
export const generateToken = (user: { idUsers: number; email: string; rol: string }): string => {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        throw new Error('JWT_SECRET no está configurado');
    }

    return jwt.sign(
        { 
            idUsers: user.idUsers, 
            email: user.email, 
            rol: user.rol 
        }, 
        secretKey, 
        { expiresIn: '1h' }
    );
};

// Función helper para verificar tokens
export const verifyToken = (token: string): JwtPayload | null => {
    try {
        const secretKey = process.env.JWT_SECRET || '';
        if (!secretKey) {
            return null;
        }

        return jwt.verify(token, secretKey) as JwtPayload;
    } catch (error) {
        return null;
    }
};