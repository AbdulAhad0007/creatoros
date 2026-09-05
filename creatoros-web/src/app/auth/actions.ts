'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = (formData.get('redirectTo') as string) || '/dashboard'

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Invalid credentials or user not found' }
  }

  revalidatePath(redirectTo.startsWith('/dashboard') ? '/dashboard' : redirectTo, 'layout')
  redirect(redirectTo)
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirm-password') as string,
  }
  const redirectTo = (formData.get('redirectTo') as string) || '/dashboard'
  
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.name,
      }
    }
  })

  if (error) {
    return { error: error.message || 'Failed to create user' }
  }

  revalidatePath(redirectTo.startsWith('/dashboard') ? '/dashboard' : redirectTo, 'layout')
  redirect(redirectTo)
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  redirect('/login');
}
