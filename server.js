import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Import email service (optional - won't break if email not configured)
let sendUserConfirmation, sendAdminNotification;
try {
  const emailModule = await import('./emailService.js');
  sendUserConfirmation = emailModule.sendUserConfirmation || (() => ({}));
  sendAdminNotification = emailModule.sendAdminNotification || (() => ({}));
} catch (error) {
  console.warn('Email service not available:', error.message);
  // Create dummy functions if email service fails to load
  sendUserConfirmation = async () => ({ success: false, message: 'Email not configured' });
  sendAdminNotification = async () => ({ success: false, message: 'Email not configured' });
}

const app = express();
const PORT = process.env.PORT || 3001;

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000', // For local development
  'http://localhost:3001'  // For local backend
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the frontend build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
}

// API routes will go here

// Routes for serving HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/residential', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'residential.html'));
});

app.get('/commercial', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'commercial.html'));
});

app.get('/how-it-works', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'how-it-works.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/resources', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'resources.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

// POST endpoint for lead generation form
app.post('/api/leads', async (req, res) => {
  try {
    const { full_name, email, zip_code, monthly_bill } = req.body;

    // Validation
    if (!full_name || !email || !zip_code || !monthly_bill) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }

    // Insert lead into Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert([
        { 
          full_name, 
          email, 
          zip_code, 
          monthly_bill: parseFloat(monthly_bill) 
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error details:', error);
      
      // Handle specific Supabase errors
      if (error.code === '42501') {
        return res.status(500).json({
          success: false,
          message: 'Permission denied. Please check your Supabase RLS policies.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
      
      if (error.code === '42P01') {
        return res.status(500).json({
          success: false,
          message: 'Table not found. Please create the leads table in your Supabase database.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Database error. Please check server console for details.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    const leadId = data.id;
    const leadData = {
      id: leadId,
      full_name,
      email,
      zip_code,
      monthly_bill: parseFloat(monthly_bill),
      created_at: data.created_at
    };

    // Send emails asynchronously (don't wait for email to complete)
    // This won't block the response even if email fails
    Promise.all([
      sendUserConfirmation(full_name, email, monthly_bill).catch(err => {
        console.error('Error sending user confirmation email:', err.message);
        return { success: false, error: err.message };
      }),
      sendAdminNotification(leadData).catch(err => {
        console.error('Error sending admin notification email:', err.message);
        return { success: false, error: err.message };
      })
    ]).catch(err => {
      console.error('Error in email sending process:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! We will contact you soon. Please check your email for confirmation.',
      leadId: leadId
    });
  } catch (error) {
    console.error('Unexpected error saving lead:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test Supabase connection
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .limit(1);
      
    if (error) throw error;
    
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'connected',
      email: sendUserConfirmation ? 'configured' : 'not configured',
      supabase: 'connected',
      table: data ? 'leads table accessible' : 'no data'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// Test Supabase connection on startup
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('leads').select('*').limit(1);
    if (error) throw error;
    console.log('✓ Supabase connection successful');
  } catch (err) {
    console.error('✗ Supabase connection failed:', err.message);
    console.error('  Please check your Supabase configuration in .env file');
    console.error('  Make sure your Supabase project is properly set up');
  }
}

testSupabaseConnection();

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  process.exit(0);
});

