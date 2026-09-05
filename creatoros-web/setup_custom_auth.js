require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log("Setting up database for Custom Plain Text Auth...");

  const { error: customUserError } = await supabase.rpc('exec_sql', {
    sql: `
      -- Create custom_users table
      CREATE TABLE IF NOT EXISTS public.custom_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Disable RLS on everything since we are ripping out Supabase Auth
      ALTER TABLE IF EXISTS public.content DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.ai_jobs DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.custom_users DISABLE ROW LEVEL SECURITY;

      -- Drop existing foreign keys that rely on auth.users
      ALTER TABLE IF EXISTS public.content DROP CONSTRAINT IF EXISTS content_user_id_fkey;
      ALTER TABLE IF EXISTS public.ai_jobs DROP CONSTRAINT IF EXISTS ai_jobs_user_id_fkey;

      -- Re-add foreign keys to custom_users
      -- We must delete existing data to avoid constraint violations if they point to old auth.users
      DELETE FROM public.ai_jobs;
      DELETE FROM public.content;

      ALTER TABLE public.content 
        ADD CONSTRAINT content_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.custom_users(id) ON DELETE CASCADE;

      ALTER TABLE public.ai_jobs 
        ADD CONSTRAINT ai_jobs_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.custom_users(id) ON DELETE CASCADE;
    `
  });

  if (customUserError) {
    console.error("Migration failed via RPC. Error:", customUserError);
    console.log("Please run this SQL manually in the Supabase Dashboard:");
    console.log(`
      CREATE TABLE IF NOT EXISTS public.custom_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE IF EXISTS public.content DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.ai_jobs DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.custom_users DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.content DROP CONSTRAINT IF EXISTS content_user_id_fkey;
      ALTER TABLE IF EXISTS public.ai_jobs DROP CONSTRAINT IF EXISTS ai_jobs_user_id_fkey;
      DELETE FROM public.ai_jobs;
      DELETE FROM public.content;
      ALTER TABLE public.content ADD CONSTRAINT content_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.custom_users(id) ON DELETE CASCADE;
      ALTER TABLE public.ai_jobs ADD CONSTRAINT ai_jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.custom_users(id) ON DELETE CASCADE;
    `);
  } else {
    console.log("Successfully created custom_users and modified constraints.");
  }
}

setupDatabase().catch(console.error);
