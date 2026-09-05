require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function createYoutubeUploadsTable() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING.split('?')[0];

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL.");

    // Create the youtube_uploads table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.youtube_uploads (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        tags TEXT[],
        privacy_status TEXT DEFAULT 'private',
        video_url TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("youtube_uploads table created.");

    // Enable RLS
    await client.query(`
      ALTER TABLE public.youtube_uploads ENABLE ROW LEVEL SECURITY;
    `);
    console.log("RLS enabled on youtube_uploads.");

    // Create RLS policies
    await client.query(`
      DROP POLICY IF EXISTS "Users can view own youtube uploads" ON public.youtube_uploads;
      CREATE POLICY "Users can view own youtube uploads"
      ON public.youtube_uploads FOR SELECT
      USING (auth.uid() = user_id);
    `);

    await client.query(`
      DROP POLICY IF EXISTS "Users can insert own youtube uploads" ON public.youtube_uploads;
      CREATE POLICY "Users can insert own youtube uploads"
      ON public.youtube_uploads FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    `);
    console.log("RLS policies created.");

    console.log("youtube_uploads setup complete!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

createYoutubeUploadsTable();
