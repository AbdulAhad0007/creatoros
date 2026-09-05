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
  console.log("Setting up saved_voices table...");

  const sql = `
    CREATE TABLE IF NOT EXISTS public.saved_voices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES public.custom_users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      script_text TEXT NOT NULL,
      voice_preset TEXT NOT NULL,
      tone TEXT DEFAULT 'Engaged & Excited',
      speed NUMERIC(3,1) DEFAULT 1.0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_saved_voices_user_id ON public.saved_voices(user_id);

    ALTER TABLE public.saved_voices DISABLE ROW LEVEL SECURITY;
  `;

  const { error } = await supabase.rpc('exec_sql', { sql });

  if (error) {
    console.error("Migration failed via RPC. Error:", error);
    console.log("Please run this SQL manually in the Supabase Dashboard:");
    console.log(sql);
  } else {
    console.log("Successfully created saved_voices table.");
  }
}

setupDatabase().catch(console.error);
