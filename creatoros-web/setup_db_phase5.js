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
  console.log("Setting up database for Phase 5 (AI Jobs)...");

  // Create ai_jobs table
  const { error: createJobsError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS public.ai_jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        content_id UUID REFERENCES public.content(id) ON DELETE SET NULL,
        task TEXT NOT NULL,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'processing',
        started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMPTZ,
        duration INTEGER,
        error TEXT,
        input_tokens INTEGER DEFAULT 0,
        output_tokens INTEGER DEFAULT 0,
        total_tokens INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });

  if (createJobsError && createJobsError.code !== '42883') {
    // Note: If exec_sql RPC doesn't exist, this will fail.
    // In that case, one must run the SQL manually in the Supabase SQL editor.
    console.warn("Could not execute SQL directly via RPC. Please run the following SQL manually:");
    console.log(`
      CREATE TABLE IF NOT EXISTS public.ai_jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        content_id UUID REFERENCES public.content(id) ON DELETE SET NULL,
        task TEXT NOT NULL,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'processing',
        started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMPTZ,
        duration INTEGER,
        error TEXT,
        input_tokens INTEGER DEFAULT 0,
        output_tokens INTEGER DEFAULT 0,
        total_tokens INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
  } else if (!createJobsError) {
    console.log("Successfully created ai_jobs table.");
  }

  // RLS for ai_jobs
  const { error: rlsError } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Users can view their own AI jobs" ON public.ai_jobs;
      CREATE POLICY "Users can view their own AI jobs" ON public.ai_jobs
        FOR SELECT USING (auth.uid() = user_id);
        
      DROP POLICY IF EXISTS "Users can insert their own AI jobs" ON public.ai_jobs;
      CREATE POLICY "Users can insert their own AI jobs" ON public.ai_jobs
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    `
  });

  if (rlsError && rlsError.code !== '42883') {
    console.warn("Could not apply RLS automatically. Please run the SQL manually.");
  } else if (!rlsError) {
    console.log("Successfully applied RLS to ai_jobs.");
  }

  console.log("Database setup complete.");
}

setupDatabase().catch(console.error);
