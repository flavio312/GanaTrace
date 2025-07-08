### API DE GANATRACE

## Funcionalidades terminadas
## Módulo de usuario
# /user/getUser     
Llamada de todos los usuario en la base de datos
# /user/getUser/:idUsers 
Llamada de un usuario especifico en la base de datos por el idUser
# /user/register
Función de registro de usuario para que pueda acceder a la cuenta con ciertos campos
# /user/updateUser/idUsers
Funcion de actualizar el usuario en dado caso que lo requiera
# /user/deleteUser/idUsers
Función para eliminar a un usuario por el idUsers asignado al inicio

## Módulo de registro de ganado
# /management/cow
Función para consultar los ganados registrados de el usuario especifico (Ya autenticado)
# /management/cow/:idCows
Función para consultar una cabeza de ganado por el id registrados de el usuario especifico (Ya autenticado)
# /management/cow
Función para registrar una cabeza de ganado al sistema
# /management/cow/:idCows
Función para actualizar la  de ganado en dado caso que lo requiera
# /management/cow/:idCows
Función para eliminar un ganado

## Módulo para Logeo, recuperar contraseña
# /auth/login 
Función para que se pueda logear un usuario por emai y contraseña
# /auth/forgot-recu
Funcionalidad para que pueda recuperar la contraseña del usuario
# auth/verify-reset-token
Verifica que el token exista en la base de datos para que pueda recuperar la contraseña
# auth/reset-password
Funcionalidad para poder restablecer la contraseña de un usuario

## Funcionalidades de la Api
# Registro de usuario con autenticación
# Logeo de usuario autenticado
# Recuperación de contraseña por medio de correo electrocnico
# Registro de cabeza de ganado por usuario
# Módulo de compra de ganado
# Módulo de venta de ganado
# Módulo de exportación
# Módulo de Producción lactea
# Módulo de elaboración de derivados
# Módulo de finanzas y reportes 
# Módulo de usuarios