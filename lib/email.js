import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendUserConfirmation = async (to, name) => {
  try {
    await transporter.sendMail({
      from: `"Solar Energy" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Thank you for your interest!',
      html: `Hello ${name},<br><br>Thank you for contacting us!`,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending user email:', error);
    return { success: false, error: error.message };
  }
};

export const sendAdminNotification = async (formData) => {
  try {
    await transporter.sendMail({
      from: `"Website Notification" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Lead Submission',
      html: `New lead details:<br><pre>${JSON.stringify(formData, null, 2)}</pre>`,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending admin email:', error);
    return { success: false, error: error.message };
  }
};
