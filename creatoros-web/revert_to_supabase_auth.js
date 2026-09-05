require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function revertDatabase() {
  console.log("Reverting database to use native Supabase Auth...");

  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      -- Delete all existing data as it points to custom_users UUIDs that won't match auth.users
      TRUNCATE TABLE public.saved_voices CASCADE;
      TRUNCATE TABLE public.saved_videos CASCADE;
      TRUNCATE TABLE public.youtube_credentials CASCADE;
      TRUNCATE TABLE public.saved_images CASCADE;
      TRUNCATE TABLE public.ai_jobs CASCADE;
      TRUNCATE TABLE public.content CASCADE;

      -- Drop custom_users constraints
      ALTER TABLE IF EXISTS public.saved_voices DROP CONSTRAINT IF EXISTS saved_voices_user_id_fkey;
      ALTER TABLE IF EXISTS public.saved_videos DROP CONSTRAINT IF EXISTS saved_videos_user_id_fkey;
      ALTER TABLE IF EXISTS public.youtube_credentials DROP CONSTRAINT IF EXISTS youtube_credentials_user_id_fkey;
      ALTER TABLE IF EXISTS public.saved_images DROP CONSTRAINT IF EXISTS saved_images_user_id_fkey;
      ALTER TABLE IF EXISTS public.content DROP CONSTRAINT IF EXISTS content_user_id_fkey;
      ALTER TABLE IF EXISTS public.ai_jobs DROP CONSTRAINT IF EXISTS ai_jobs_user_id_fkey;

      -- Re-add constraints to auth.users
      ALTER TABLE public.saved_voices ADD CONSTRAINT saved_voices_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
      ALTER TABLE public.saved_videos ADD CONSTRAINT saved_videos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
      ALTER TABLE public.youtube_credentials ADD CONSTRAINT youtube_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
      ALTER TABLE public.saved_images ADD CONSTRAINT saved_images_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
      ALTER TABLE public.content ADD CONSTRAINT content_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
      ALTER TABLE public.ai_jobs ADD CONSTRAINT ai_jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

      -- Re-enable RLS on everything
      ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.saved_images ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.saved_videos ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.saved_voices ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.youtube_credentials ENABLE ROW LEVEL SECURITY;
      
      -- We must also add RLS policies so users can actually read/write their data!
      
      -- Function to create basic CRUD policies for a table where user_id matches auth.uid()
      CREATE OR REPLACE FUNCTION create_basic_rls_policies(target_table text) RETURNS void AS $$
      BEGIN
        EXECUTE format('DROP POLICY IF EXISTS "Users can view own data" ON %I', target_table);
        EXECUTE format('DROP POLICY IF EXISTS "Users can insert own data" ON %I', target_table);
        EXECUTE format('DROP POLICY IF EXISTS "Users can update own data" ON %I', target_table);
        EXECUTE format('DROP POLICY IF EXISTS "Users can delete own data" ON %I', target_table);
        
        EXECUTE format('CREATE POLICY "Users can view own data" ON %I FOR SELECT USING (auth.uid() = user_id)', target_table);
        EXECUTE format('CREATE POLICY "Users can insert own data" ON %I FOR INSERT WITH CHECK (auth.uid() = user_id)', target_table);
        EXECUTE format('CREATE POLICY "Users can update own data" ON %I FOR UPDATE USING (auth.uid() = user_id)', target_table);
        EXECUTE format('CREATE POLICY "Users can delete own data" ON %I FOR DELETE USING (auth.uid() = user_id)', target_table);
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
    `
  });

  if (error) {
    console.error("Failed to revert database constraints:", error);
  } else {
    console.log("Successfully reverted database to use Supabase Auth and re-enabled RLS.");
  }
}

revertDatabase().catch(console.error);
