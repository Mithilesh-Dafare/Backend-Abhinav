import { supabase } from '../../lib/supabase';
import { sendUserConfirmation, sendAdminNotification } from '../../lib/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = req.body;

    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, email, phone' 
      });
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert([formData])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: 'Failed to save lead',
        details: error.message 
      });
    }

    // Send emails (fire and forget)
    Promise.all([
      sendUserConfirmation(formData.email, formData.name),
      sendAdminNotification(formData)
    ]).catch(console.error);

    return res.status(201).json({ 
      success: true, 
      data: data[0] 
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
