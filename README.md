# 🐄 GanaTrace API

API RESTful para la gestión de ganado y usuarios en un sistema de trazabilidad agropecuaria. Esta API permite registrar, consultar, actualizar y eliminar información de usuarios y cabezas de ganado, así como funcionalidades de autenticación y recuperación de contraseña.

---

## 📁 Estructura del Proyecto

```
src/
├── configuration/              # Configuración y conexión a la base de datos
├── controllers/                # Lógica de negocio para usuarios, ganado y login
├── middlewares/               # Middleware de autenticación
├── models/                    # Definición de modelos de datos (Users y Cows)
├── routes/                    # Definición de rutas para cada módulo
├── services/                  # Servicios adicionales como envío de correo
├── .env                       # Variables de entorno
├── index.ts                   # Punto de entrada de la aplicación
└── .gitignore
```

---

## 🚀 Endpoints Disponibles

### 👤 Módulo de Usuario

| Método | Endpoint                  | Descripción                                        |
|--------|---------------------------|----------------------------------------------------|
| GET    | `/user/getUser`           | Obtener todos los usuarios                        |
| GET    | `/user/getUser/:idUsers`  | Obtener un usuario por su ID                      |
| POST   | `/user/register`          | Registrar un nuevo usuario                        |
| PUT    | `/user/updateUser/:idUsers` | Actualizar información de un usuario            |
| DELETE | `/user/deleteUser/:idUsers` | Eliminar un usuario por su ID                   |

### 🐮 Módulo de Gestión de Ganado

| Método | Endpoint                     | Descripción                                         |
|--------|------------------------------|-----------------------------------------------------|
| GET    | `/management/cow`            | Consultar el ganado de un usuario autenticado       |
| GET    | `/management/cow/:idCows`    | Consultar un animal en específico                   |
| POST   | `/management/cow`            | Registrar una nueva cabeza de ganado                |
| PUT    | `/management/cow/:idCows`    | Actualizar información de una cabeza de ganado      |
| DELETE | `/management/cow/:idCows`    | Eliminar una cabeza de ganado                       |

### 🔐 Módulo de Autenticación

| Método | Endpoint                  | Descripción                                              |
|--------|---------------------------|----------------------------------------------------------|
| POST   | `/auth/login`            | Iniciar sesión con correo y contraseña                   |
| POST   | `/auth/forgot-recu`      | Recuperar contraseña por correo electrónico              |
| POST   | `/auth/verify-reset-token` | Verificar token de recuperación                         |
| POST   | `/auth/reset-password`   | Restablecer la contraseña                                |

---

## 🎯 Funcionalidades Implementadas

- Registro y autenticación de usuarios
- Gestión de cabezas de ganado asociadas al usuario
- Recuperación y restablecimiento de contraseña
- Autenticación mediante middleware
- Módulos en desarrollo:
  - Compra y venta de ganado
  - Exportación
  - Producción láctea
  - Elaboración de derivados
  - Finanzas y reportes

---

## 🛠 Tecnologías Usadas

- **Node.js** + **TypeScript**
- **Express** para construir la API
- **MongoDB** (o base de datos equivalente)
- **JWT** para autenticación
- **Nodemailer** para recuperación de contraseña
- **Dotenv** para gestión de variables de entorno

---

## 📌 Cómo empezar

1. Clonar este repositorio.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno en `.env`.
4. Levantar el servidor:
   ```bash
   npm run dev
   ```