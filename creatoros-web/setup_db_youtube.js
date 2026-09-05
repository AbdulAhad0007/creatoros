require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function createYoutubeConnectionsTable() {
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
      CREATE TABLE IF NOT EXISTS public.youtube_connections (
        user_id UUID PRIMARY KEY REFERENCES public.custom_users(id) ON DELETE CASCADE,
        google_access_token TEXT,
        google_refresh_token TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await client.query(createTableQuery);
    console.log("Successfully created youtube_connections table.");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    await client.end();
  }
}

createYoutubeConnectionsTable();
