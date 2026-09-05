require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function createImagesTable() {
  // Use connection string but remove URL params like ?sslmode=require
  const connectionString = process.env.POSTGRES_URL_NON_POOLING.split('?')[0];

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL.");

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS public.saved_images (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES public.custom_users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        image_url TEXT NOT NULL,
        style TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await client.query(createTableQuery);
    console.log("Successfully created saved_images table.");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    await client.end();
  }
}

createImagesTable();
