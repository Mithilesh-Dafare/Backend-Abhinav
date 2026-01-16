// Import the Supabase client and functions
import { getUsers, createUser } from './supabaseClient.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test function
export async function testSupabase() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test 1: Fetch users
    console.log('\n📋 Test 1: Fetching users...');
    const users = await getUsers();
    console.log(`✅ Success! Found ${users ? users.length : 0} users.`);
    
    // Test 2: Create a test user
    console.log('\n📝 Test 2: Creating test user...');
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
      created_at: new Date().toISOString()
    };
    
    const createdUser = await createUser(testUser);
    console.log('✅ Test user created:', createdUser);
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('💡 Tip: You can view your data in the Supabase dashboard.');
    
    return { success: true, createdUser };
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    
    if (error.message.includes('permission denied')) {
      console.log('\n🔒 Error: Permission denied. Please check your Row Level Security (RLS) policies in Supabase.');
    } else if (error.message.includes('relation "users" does not exist')) {
      console.log('\n❓ Error: The "users" table does not exist. Please create it in your Supabase database.');
    } else if (error.message.includes('JWT expired')) {
      console.log('\n🔑 Error: Your Supabase JWT token has expired. Please check your API keys.');
    } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('\n🌐 Error: Could not connect to Supabase. Please check your internet connection and SUPABASE_URL.');
    }
    
    return { success: false, error };
  }
}

// Run the test if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  testSupabase();
}
