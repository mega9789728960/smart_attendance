'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Enter email and password' }
  }

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    return { error: error?.message || 'Login failed' }
  }

  // ✅ ROLE & EMPLOYEE CHECK Using Server Action
  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('employee_id, role')
    .eq('auth_user_id', data.user.id)
    .single()

  if (empError || !employee) {
    await supabase.auth.signOut()
    return { error: 'You are not registered in the system.' }
  }

  revalidatePath('/', 'layout')
  
  if (employee.role === 'admin') {
    redirect('/dashboard')
  } else {
    redirect('/attendance')
  }
}
