const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL_NON_POOLING,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to Supabase.");
    
    // Create the custom_users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.custom_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("Table custom_users ensured.");

    // Grant API permissions so PostgREST can see it!
    await client.query(`
      GRANT ALL ON TABLE public.custom_users TO anon, authenticated, service_role;
      GRANT ALL ON TABLE public.content TO anon, authenticated, service_role;
    `);
    console.log("API Permissions granted.");

    // Disable RLS
    await client.query(`
      ALTER TABLE IF EXISTS public.content DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.custom_users DISABLE ROW LEVEL SECURITY;
    `);
    console.log("RLS disabled.");

    // Drop old foreign keys
    await client.query(`
      ALTER TABLE IF EXISTS public.content DROP CONSTRAINT IF EXISTS content_user_id_fkey;
    `);
    
    // Clean tables to prevent foreign key violations when mapping
    await client.query(`
      DELETE FROM public.content;
    `);

    // Add new foreign keys
    await client.query(`
      ALTER TABLE public.content 
        ADD CONSTRAINT content_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.custom_users(id) ON DELETE CASCADE;
    `);
    console.log("Foreign keys updated.");

    // Reload schema cache
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log("Schema cache reloaded successfully!");
    
  } catch (error) {
    console.error("Failed to setup database:", error);
  } finally {
    await client.end();
  }
}

setupDatabase();
