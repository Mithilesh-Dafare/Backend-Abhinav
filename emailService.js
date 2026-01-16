import nodemailer from 'nodemailer';

// Create transporter based on environment variables
const createTransporter = () => {
  // For Gmail, use OAuth2 or App Password
  // For other SMTP servers, adjust accordingly
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD, // Use App Password for Gmail
    },
  });

  return transporter;
};

// Email templates
const getUserConfirmationEmail = (name, email, monthlyBill) => {
  return {
    subject: 'Thank You for Your Interest in Solar Energy!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #007BFF, #87CEEB);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: #007BFF;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
          }
          .info-box {
            background: white;
            padding: 20px;
            border-left: 4px solid #007BFF;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌞 Thank You, ${name}!</h1>
        </div>
        <div class="content">
          <p>We've received your request for a free solar energy quote and we're excited to help you make the switch to clean, renewable energy!</p>
          
          <div class="info-box">
            <h3>Your Submission Details:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Monthly Electric Bill:</strong> $${parseFloat(monthlyBill).toFixed(2)}</p>
          </div>

          <h3>What Happens Next?</h3>
          <ol>
            <li><strong>Within 24 hours:</strong> One of our solar energy experts will contact you to discuss your energy needs.</li>
            <li><strong>Free consultation:</strong> We'll assess your property and provide a customized solar solution.</li>
            <li><strong>Custom quote:</strong> Receive a detailed quote tailored to your specific situation.</li>
          </ol>

          <p>Our team is committed to helping you save money while reducing your carbon footprint. We'll be in touch soon!</p>

          <p>If you have any questions in the meantime, feel free to reach out to us at <a href="mailto:info@solarpro.com">info@solarpro.com</a> or call us at (555) 123-4567.</p>

          <p>Best regards,<br>
          <strong>The SolarPro Team</strong></p>
        </div>
        <div class="footer">
          <p>SolarPro - Powering the future with clean, renewable solar energy</p>
          <p>This is an automated email. Please do not reply directly to this message.</p>
        </div>
      </body>
      </html>
    `,
    text: `
Thank You, ${name}!

We've received your request for a free solar energy quote and we're excited to help you make the switch to clean, renewable energy!

Your Submission Details:
- Name: ${name}
- Email: ${email}
- Monthly Electric Bill: $${parseFloat(monthlyBill).toFixed(2)}

What Happens Next?
1. Within 24 hours: One of our solar energy experts will contact you to discuss your energy needs.
2. Free consultation: We'll assess your property and provide a customized solar solution.
3. Custom quote: Receive a detailed quote tailored to your specific situation.

Our team is committed to helping you save money while reducing your carbon footprint. We'll be in touch soon!

If you have any questions in the meantime, feel free to reach out to us at info@solarpro.com or call us at (555) 123-4567.

Best regards,
The SolarPro Team

---
SolarPro - Powering the future with clean, renewable solar energy
This is an automated email. Please do not reply directly to this message.
    `
  };
};

const getAdminNotificationEmail = (leadData) => {
  const { full_name, email, zip_code, monthly_bill, created_at } = leadData;
  const formattedDate = new Date(created_at).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return {
    subject: `New Lead: ${full_name} - Solar Quote Request`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #007BFF, #87CEEB);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .lead-info {
            background: white;
            padding: 20px;
            border-left: 4px solid #007BFF;
            margin: 20px 0;
          }
          .lead-info h3 {
            margin-top: 0;
            color: #007BFF;
          }
          .lead-info p {
            margin: 10px 0;
          }
          .action-button {
            display: inline-block;
            padding: 12px 30px;
            background: #007BFF;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
          }
          .priority {
            background: #fff3cd;
            padding: 15px;
            border-left: 4px solid #ffc107;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔔 New Lead Received</h1>
        </div>
        <div class="content">
          <p>A new customer has submitted a request for a solar energy quote.</p>
          
          <div class="lead-info">
            <h3>Lead Information</h3>
            <p><strong>Name:</strong> ${full_name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Zip Code:</strong> ${zip_code}</p>
            <p><strong>Monthly Electric Bill:</strong> $${parseFloat(monthly_bill).toFixed(2)}</p>
            <p><strong>Submitted:</strong> ${formattedDate}</p>
          </div>

          <div class="priority">
            <strong>⚠️ Action Required:</strong> Please contact this lead within 24 hours for best conversion rates.
          </div>

          <p><strong>Estimated Potential:</strong></p>
          <ul>
            <li>Annual bill: $${(parseFloat(monthly_bill) * 12).toFixed(2)}</li>
            <li>Potential savings: $${(parseFloat(monthly_bill) * 12 * 0.9).toFixed(2)}/year with solar</li>
            <li>System size estimate: ${Math.ceil((parseFloat(monthly_bill) / 0.13 / 120) * 10) / 10} kW</li>
          </ul>

          <p>
            <a href="mailto:${email}?subject=Re: Your Solar Energy Quote Request" class="action-button">Reply to Lead</a>
          </p>

          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Review the lead information above</li>
            <li>Contact the customer via email or phone</li>
            <li>Schedule a consultation</li>
            <li>Update CRM system with lead status</li>
          </ol>
        </div>
        <div class="footer">
          <p>SolarPro Lead Management System</p>
          <p>This is an automated notification. Lead ID: ${leadData.id}</p>
        </div>
      </body>
      </html>
    `,
    text: `
New Lead Received

A new customer has submitted a request for a solar energy quote.

Lead Information:
- Name: ${full_name}
- Email: ${email}
- Zip Code: ${zip_code}
- Monthly Electric Bill: $${parseFloat(monthly_bill).toFixed(2)}
- Submitted: ${formattedDate}

Action Required: Please contact this lead within 24 hours for best conversion rates.

Estimated Potential:
- Annual bill: $${(parseFloat(monthly_bill) * 12).toFixed(2)}
- Potential savings: $${(parseFloat(monthly_bill) * 12 * 0.9).toFixed(2)}/year with solar
- System size estimate: ${Math.ceil((parseFloat(monthly_bill) / 0.13 / 120) * 10) / 10} kW

Next Steps:
1. Review the lead information above
2. Contact the customer via email or phone
3. Schedule a consultation
4. Update CRM system with lead status

---
SolarPro Lead Management System
This is an automated notification. Lead ID: ${leadData.id}
    `
  };
};

// Send email function
const sendEmail = async (to, subject, html, text) => {
  try {
    // Check if email is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn('Email not configured. Skipping email send.');
      return { success: false, message: 'Email not configured' };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"SolarPro" <${process.env.SMTP_USER}>`,
      to: to,
      subject: subject,
      html: html,
      text: text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send user confirmation email
const sendUserConfirmation = async (name, email, monthlyBill) => {
  const emailContent = getUserConfirmationEmail(name, email, monthlyBill);
  return await sendEmail(
    email,
    emailContent.subject,
    emailContent.html,
    emailContent.text
  );
};

// Send admin notification email
const sendAdminNotification = async (leadData) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  const emailContent = getAdminNotificationEmail(leadData);
  return await sendEmail(
    adminEmail,
    emailContent.subject,
    emailContent.html,
    emailContent.text
  );
};

export { sendUserConfirmation, sendAdminNotification, sendEmail };

