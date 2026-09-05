'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error, data: authData } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: 'Invalid credentials or user not found' }
  }

  // Check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()
    
  if (profile?.role !== 'admin') {
    await supabase.auth.signOut()
    return { error: 'Access denied: You do not have administrator privileges.' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
