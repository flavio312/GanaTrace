import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
  tls:{
    rejectUnauthorized: false,
  },
});

// Verificar variables de entorno
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.log("Configuración de email no completa");
}

export const verifyConnection = async (): Promise<void> => {
  try {
    await transporter.verify();
    console.log("✅ Conexión SMTP exitosa");
  } catch (error) {
    console.error("❌ Error al conectar con el servidor SMTP:", error);
  }
};

export const sendEmail = async ({to, subject, html, text}:{  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,                         
      subject,                    
      html,
      text             
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);
    console.log(`Correo enviado a ${to}`);
  } catch (error) {
    console.error('Error al enviar correo:', error);
    throw new Error('No se pudo enviar el correo.');
  }

  transporter.verify((error, success) => {
    if (error) {
      console.error('Error al conectar:', error);
    } else {
      console.log('Servidor listo para enviar correos');
    }
  });
  
};  