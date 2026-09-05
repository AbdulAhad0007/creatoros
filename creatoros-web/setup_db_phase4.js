/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function setupPhase3Database() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error("Missing POSTGRES_URL or POSTGRES_URL_NON_POOLING in .env.local");
    process.exit(1);
  }

  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to the database. Executing Phase 3 setup script...");

    const sql = `
      -- 1. Create Enums
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_status') THEN
          CREATE TYPE content_status AS ENUM ('draft', 'processing', 'ready', 'scheduled', 'published', 'failed');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_type') THEN
          CREATE TYPE content_type AS ENUM ('lesson', 'short_video', 'long_video', 'social_post');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_platform') THEN
          CREATE TYPE content_platform AS ENUM ('youtube', 'instagram', 'facebook', 'linkedin', 'general');
        END IF;
      END$$;

      -- 2. Create the content table
      CREATE TABLE IF NOT EXISTS public.content (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        title TEXT NOT NULL,
        topic TEXT,
        description TEXT,
        script TEXT,
        caption TEXT,
        hashtags TEXT,
        status content_status DEFAULT 'draft'::content_status NOT NULL,
        content_type content_type NOT NULL,
        platform content_platform NOT NULL,
        thumbnail_url TEXT,
        video_url TEXT,
        audio_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 3. Create Indexes
      CREATE INDEX IF NOT EXISTS idx_content_user_id ON public.content(user_id);
      CREATE INDEX IF NOT EXISTS idx_content_status ON public.content(status);
      CREATE INDEX IF NOT EXISTS idx_content_created_at ON public.content(created_at);

      -- 4. Enable Row Level Security (RLS)
      ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

      -- 5. Create RLS Policies
      DROP POLICY IF EXISTS "Users can manage their own content" ON public.content;

      -- Create policy that allows users to perform all operations on their own content rows.
      CREATE POLICY "Users can manage their own content" 
      ON public.content
      FOR ALL 
      USING (auth.uid() = user_id) 
      WITH CHECK (auth.uid() = user_id);

      -- 6. Trigger for updated_at
      CREATE OR REPLACE FUNCTION public.update_content_updated_at()
      RETURNS trigger AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS content_updated_at_trigger ON public.content;
      CREATE TRIGGER content_updated_at_trigger
        BEFORE UPDATE ON public.content
        FOR EACH ROW EXECUTE PROCEDURE public.update_content_updated_at();
    `;

    await client.query(sql);
    console.log("Phase 3 Database setup completed successfully.");

  } catch (error) {
    console.error("Error setting up Phase 3 database:", error);
  } finally {
    await client.end();
  }
}

setupPhase3Database();
