import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

// Validar variables de entorno
const requiredEnvVars = [
  'GMAIL_CLIENT_ID',
  'GMAIL_CLIENT_SECRET', 
  'GMAIL_REFRESH_TOKEN',
  'EMAIL_USER'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Variable de entorno requerida: ${envVar}`);
  }
}

const CLIENT_ID = process.env.GMAIL_CLIENT_ID!;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET!;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN!;
const EMAIL_USER = process.env.EMAIL_USER!;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
  }>;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    // Validar que al menos uno de html o text esté presente
    if (!options.html && !options.text) {
      throw new Error('Debe proporcionar al menos html o text');
    }

    const accessToken = await oAuth2Client.getAccessToken();

    if (!accessToken.token) {
      throw new Error('No se pudo obtener el access token');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: EMAIL_USER,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    // Verificar conexión
    await transporter.verify();

    const mailOptions = {
      from: `Tu App <${EMAIL_USER}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html, // Fallback a html si no hay text
      attachments: options.attachments,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Correo enviado exitosamente: ${result.messageId}`);
  
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
    
    // Proporcionar más información sobre el error
    if (error instanceof Error) {
      if (error.message.includes('invalid_grant')) {
        throw new Error('Refresh token inválido o expirado. Genera uno nuevo.');
      }
      if (error.message.includes('insufficient authentication')) {
        throw new Error('Credenciales OAuth2 inválidas. Verifica CLIENT_ID y CLIENT_SECRET.');
      }
    }
    
    throw new Error(`No se pudo enviar el correo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

// Función auxiliar para enviar correos de prueba
export const sendTestEmail = async (to: string): Promise<void> => {
  await sendEmail({
    to,
    subject: 'Prueba de Gmail API',
    html: `
      <h2>¡Funciona!</h2>
      <p>Tu configuración de Gmail API está funcionando correctamente.</p>
      <p>Enviado el: ${new Date().toLocaleString()}</p>
    `,
    text: 'Tu configuración de Gmail API está funcionando correctamente.'
  });
};