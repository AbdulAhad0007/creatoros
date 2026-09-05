require('dotenv').config({ path: '.env.local' });
const pg = require('pg');

const connectionStr = process.env.POSTGRES_URL_NON_POOLING.split('?')[0];

const client = new pg.Client({
  connectionString: connectionStr,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  console.log("Connected to Postgres.");

  await client.query(`
    CREATE TABLE IF NOT EXISTS public.saved_voices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES public.custom_users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      script_text TEXT NOT NULL,
      voice_preset TEXT NOT NULL,
      tone TEXT DEFAULT 'Engaged and Excited',
      speed NUMERIC(3,1) DEFAULT 1.0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_saved_voices_user_id ON public.saved_voices(user_id);
  `);

  console.log("SUCCESS: saved_voices table created.");
  await client.end();
}

run().catch(e => {
  console.error("ERROR:", e.message);
  client.end();
});
