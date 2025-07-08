import express from 'express';
import { login, recupContraseña, verificarToken, restablecerContraseña, solicitarCambioContraseña } from '../controllers/Login.controller';
import { authenticateToken, requireAdmin, requireModerator, requireOwnershipOrAdmin,optionalAuth,validateTokenFormat,refreshToken} from '../middlewares/authenticate';

const router = express.Router();

router.post('/login', login);
router.post('/forgot-recu', recupContraseña);
router.get('/verify-reset-token', verificarToken);
router.post('/reset-password', restablecerContraseña);

// ========== RUTAS PROTEGIDAS (requieren autenticación) ==========
// Cambiar contraseña estando autenticado
router.post('/change-password', authenticateToken, solicitarCambioContraseña);

// Obtener perfil del usuario autenticado
router.get('/profile', authenticateToken, refreshToken, (req, res) => {
    res.json({
        user: req.user,
        message: 'Perfil obtenido exitosamente'
    });
});

// Actualizar perfil del usuario autenticado
router.put('/profile', authenticateToken, (req, res) => {
    // Lógica para actualizar perfil
    res.json({ message: 'Perfil actualizado', user: req.user });
});

// ========== RUTAS CON VERIFICACIÓN DE ROLES ==========
// Solo administradores pueden acceder
router.get('/admin/users', authenticateToken, requireAdmin, (req, res) => {
    res.json({ message: 'Lista de usuarios (solo admin)', user: req.user });
});

// Administradores y moderadores pueden acceder
router.get('/moderation/reports', authenticateToken, requireModerator, (req, res) => {
    res.json({ message: 'Reportes de moderación', user: req.user });
});

// ========== RUTAS CON VERIFICACIÓN DE PROPIEDAD ==========
// Solo el propietario o admin pueden acceder
router.get('/user/:userId/private-data', authenticateToken, requireOwnershipOrAdmin, (req, res) => {
    res.json({ 
        message: 'Datos privados del usuario', 
        user: req.user,
        targetUserId: req.params.userId 
    });
});

// ========== RUTAS CON AUTENTICACIÓN OPCIONAL ==========
// Funciona con o sin token
router.get('/posts', optionalAuth, (req, res) => {
    const isAuthenticated = !!req.user;
    res.json({
        message: 'Lista de posts',
        authenticated: isAuthenticated,
        user: req.user || null
    });
});


router.post('/protected-action', 
    validateTokenFormat,
    authenticateToken,
    requireAdmin,
    (req, res) => {
        res.json({ 
            message: 'Acción protegida ejecutada',
            user: req.user 
        });
    }
);

export default router;