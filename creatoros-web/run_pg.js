require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.POSTGRES_URL_NON_POOLING.split('?')[0],
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL database.");

    const sql = `
      DO $$ 
      BEGIN
        BEGIN TRUNCATE TABLE public.saved_voices CASCADE; EXCEPTION WHEN OTHERS THEN END;
        BEGIN TRUNCATE TABLE public.saved_videos CASCADE; EXCEPTION WHEN OTHERS THEN END;
        BEGIN TRUNCATE TABLE public.youtube_credentials CASCADE; EXCEPTION WHEN OTHERS THEN END;
        BEGIN TRUNCATE TABLE public.saved_images CASCADE; EXCEPTION WHEN OTHERS THEN END;
        BEGIN TRUNCATE TABLE public.ai_jobs CASCADE; EXCEPTION WHEN OTHERS THEN END;
        BEGIN TRUNCATE TABLE public.content CASCADE; EXCEPTION WHEN OTHERS THEN END;
      END $$;

      DO $$
      BEGIN
        BEGIN ALTER TABLE IF EXISTS public.saved_voices DROP CONSTRAINT IF EXISTS saved_voices_user_id_fkey; EXCEPTION WHEN OTHERS THEN END;
        BEGIN ALTER TABLE IF EXISTS public.saved_videos DROP CONSTRAINT IF EXISTS saved_videos_user_id_fkey; EXCEPTION WHEN OTHERS THEN END;
        BEGIN ALTER TABLE IF EXISTS public.youtube_credentials DROP CONSTRAINT IF EXISTS youtube_credentials_user_id_fkey; EXCEPTION WHEN OTHERS THEN END;
        BEGIN ALTER TABLE IF EXISTS public.saved_images DROP CONSTRAINT IF EXISTS saved_images_user_id_fkey; EXCEPTION WHEN OTHERS THEN END;
        BEGIN ALTER TABLE IF EXISTS public.content DROP CONSTRAINT IF EXISTS content_user_id_fkey; EXCEPTION WHEN OTHERS THEN END;
        BEGIN ALTER TABLE IF EXISTS public.ai_jobs DROP CONSTRAINT IF EXISTS ai_jobs_user_id_fkey; EXCEPTION WHEN OTHERS THEN END;
      END $$;

      DO $$
      BEGIN
        BEGIN ALTER TABLE IF EXISTS public.saved_voices ADD CONSTRAINT saved_voices_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; EXCEPTION WHEN OTHERS THEN END;
        BEGIN ALTER TABLE IF EXISTS public.saved_videos ADD CONSTRAINT saved_videos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; EXCEPTION WHEN OTHERS THEN END;
        BEGIN ALTER TABLE IF EXISTS public.youtube_credentials ADD CONSTRAINT youtube_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; EXCEPTION WHEN OTHERS THEN END;
        BEGIN ALTER TABLE IF EXISTS public.saved_images ADD CONSTRAINT saved_images_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; EXCEPTION WHEN OTHERS THEN END;
        BEGIN ALTER TABLE IF EXISTS public.content ADD CONSTRAINT content_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; EXCEPTION WHEN OTHERS THEN END;
        BEGIN ALTER TABLE IF EXISTS public.ai_jobs ADD CONSTRAINT ai_jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; EXCEPTION WHEN OTHERS THEN END;
      END $$;

      DO $$
      BEGIN
        BEGIN ALTER TABLE IF EXISTS public.content ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN END;
        BEGIN ALTER TABLE IF EXISTS public.ai_jobs ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN END;
        BEGIN ALTER TABLE IF EXISTS public.saved_images ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN END;
        BEGIN ALTER TABLE IF EXISTS public.saved_videos ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN END;
        BEGIN ALTER TABLE IF EXISTS public.saved_voices ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN END;
        BEGIN ALTER TABLE IF EXISTS public.youtube_credentials ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN OTHERS THEN END;
      END $$;
      
      -- Function to create basic CRUD policies for a table where user_id matches auth.uid()
      CREATE OR REPLACE FUNCTION create_basic_rls_policies(target_table text) RETURNS void AS $$
      BEGIN
        IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = target_table) THEN
          EXECUTE format('DROP POLICY IF EXISTS "Users can view own data" ON %I', target_table);
          EXECUTE format('DROP POLICY IF EXISTS "Users can insert own data" ON %I', target_table);
          EXECUTE format('DROP POLICY IF EXISTS "Users can update own data" ON %I', target_table);
          EXECUTE format('DROP POLICY IF EXISTS "Users can delete own data" ON %I', target_table);
          
          EXECUTE format('CREATE POLICY "Users can view own data" ON %I FOR SELECT USING (auth.uid() = user_id)', target_table);
          EXECUTE format('CREATE POLICY "Users can insert own data" ON %I FOR INSERT WITH CHECK (auth.uid() = user_id)', target_table);
          EXECUTE format('CREATE POLICY "Users can update own data" ON %I FOR UPDATE USING (auth.uid() = user_id)', target_table);
          EXECUTE format('CREATE POLICY "Users can delete own data" ON %I FOR DELETE USING (auth.uid() = user_id)', target_table);
        END IF;
      END;
      $$ LANGUAGE plpgsql;
      
      SELECT create_basic_rls_policies('content');
      SELECT create_basic_rls_policies('ai_jobs');
      SELECT create_basic_rls_policies('saved_images');
      SELECT create_basic_rls_policies('saved_videos');
      SELECT create_basic_rls_policies('saved_voices');
      SELECT create_basic_rls_policies('youtube_credentials');
      
      -- Finally, drop the custom_users table entirely
      DROP TABLE IF EXISTS public.custom_users CASCADE;
    `;

    await client.query(sql);
    console.log("Successfully reverted schema to use auth.users and RLS.");
  } catch (error) {
    console.error("Database error:", error);
  } finally {
    await client.end();
  }
}

run();
