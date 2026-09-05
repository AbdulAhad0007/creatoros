/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function setupDatabase() {
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
    console.log("Connected to the database. Executing setup script...");

    const sql = `
      -- 1. Create role enum if it doesn't exist
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE user_role AS ENUM ('user', 'admin');
        END IF;
      END$$;

      -- 2. Create the profiles table
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        full_name TEXT,
        avatar_url TEXT,
        role user_role DEFAULT 'user'::user_role NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 3. Enable Row Level Security (RLS)
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

      -- 4. Create RLS Policies
      -- Drop them first to make this script idempotent
      DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
      DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
      DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
      DROP POLICY IF EXISTS "Admins have full access." ON public.profiles;

      -- Allow users to read their own profile
      CREATE POLICY "Users can view their own profile." ON public.profiles
        FOR SELECT USING (auth.uid() = id);

      -- Allow users to update their own profile (but not the role)
      -- Postgres doesn't easily restrict column updates in policies directly without complex views,
      -- but we can restrict what rows they can update. To prevent role updates, we can use a trigger 
      -- or just assume the server handles role assignments securely and RLS restricts which row to update.
      -- Better yet, a trigger to prevent role modification by non-admins.
      CREATE POLICY "Users can update own profile." ON public.profiles
        FOR UPDATE USING (auth.uid() = id);

      -- Allow admins to read all profiles
      CREATE POLICY "Admins have full access." ON public.profiles
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
          )
        );

      -- 5. Trigger to automatically create a profile for new users
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO public.profiles (id, full_name, avatar_url)
        VALUES (
          new.id, 
          COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
          COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
        );
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Drop the trigger if it exists and recreate
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

      -- 6. Trigger to prevent normal users from modifying their role
      CREATE OR REPLACE FUNCTION public.protect_role_update()
      RETURNS trigger AS $$
      BEGIN
        -- If the role is being changed, check if the current user is an admin
        IF NEW.role IS DISTINCT FROM OLD.role THEN
          -- This check runs in the context of the user making the query.
          -- Since Supabase sets the role to 'authenticated' and we have auth.uid(),
          -- we can verify the actual role from the table (or rely on the fact that this is checked in the RLS).
          -- However, triggers run under table owner privileges unless SECURITY DEFINER.
          -- A simple way is to check the current user's role from the profiles table.
          IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
            RAISE EXCEPTION 'You are not authorized to change the role.';
          END IF;
        END IF;
        
        -- Update the updated_at timestamp
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS protect_role_update_trigger ON public.profiles;
      CREATE TRIGGER protect_role_update_trigger
        BEFORE UPDATE ON public.profiles
        FOR EACH ROW EXECUTE PROCEDURE public.protect_role_update();
    `;

    await client.query(sql);
    console.log("Database setup completed successfully.");

  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    await client.end();
  }
}

setupDatabase();
