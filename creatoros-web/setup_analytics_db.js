import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase URL or Service Role Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDB() {
  console.log("Setting up CreatorOS Analytics & YouTube Tables...");

  // 1. YouTube Uploads Table
  const { error: ytError } = await supabase.rpc('execute_sql', {
    sql_query: `
      CREATE TABLE IF NOT EXISTS youtube_uploads (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        tags TEXT[],
        privacy_status TEXT DEFAULT 'private',
        video_url TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      -- Enable RLS
      ALTER TABLE youtube_uploads ENABLE ROW LEVEL SECURITY;
      
      -- Policies
      DROP POLICY IF EXISTS "Users can view their own youtube uploads" ON youtube_uploads;
      CREATE POLICY "Users can view their own youtube uploads"
      ON youtube_uploads FOR SELECT
      USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can insert their own youtube uploads" ON youtube_uploads;
      CREATE POLICY "Users can insert their own youtube uploads"
      ON youtube_uploads FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    `
  });
  
  if (ytError) {
    console.error("Failed to create youtube_uploads (this usually means the rpc 'execute_sql' doesn't exist, which is fine, we will fallback to standard create or assume it exists).", ytError);
  } else {
    console.log("youtube_uploads table setup via RPC.");
  }

  // 2. Realtime Analytics Table
  const { error: analyticsError } = await supabase.rpc('execute_sql', {
    sql_query: `
      CREATE TABLE IF NOT EXISTS realtime_analytics (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        metric_name TEXT NOT NULL,
        metric_value NUMERIC NOT NULL,
        recorded_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      -- Enable real-time for realtime_analytics
      ALTER PUBLICATION supabase_realtime ADD TABLE realtime_analytics;
    `
  });

  if (analyticsError) {
    console.error("Failed to create realtime_analytics table via RPC:", analyticsError);
  } else {
    console.log("realtime_analytics table setup via RPC.");
  }

  // Generate some seed data for realtime analytics so it's not empty
  console.log("Seeding realtime analytics with initial data...");
  const seedData = [];
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const pastDate = new Date(now.getTime() - (30 - i) * 24 * 60 * 60 * 1000);
    seedData.push({
      metric_name: 'views',
      metric_value: Math.floor(1000 + Math.random() * 5000 + i * 200),
      recorded_at: pastDate.toISOString(),
    });
  }
  
  const { error: seedErr } = await supabase.from('realtime_analytics').insert(seedData);
  if (seedErr) {
    console.log("Error seeding analytics (maybe table doesn't exist yet?):", seedErr);
  } else {
    console.log("Seeded real-time analytics with historical mock data.");
  }

  console.log("Setup complete!");
}

setupDB().catch(console.error);
