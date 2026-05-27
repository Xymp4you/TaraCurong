import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = "force-dynamic";

// The role the user picked is encoded in `next` (e.g. /employer/dashboard).
// Only jobseeker/employer can be self-assigned via social login — never admin.
function roleFromNext(next: string | null): 'jobseeker' | 'employer' {
  const seg = (next ?? '').split('/').filter(Boolean)[0]
  return seg === 'employer' ? 'employer' : 'jobseeker'
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  const supabase = await createClient()
  const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

  if (sessionError || !data.user) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  const user = data.user
  const meta = user.user_metadata ?? {}
  // Role from metadata is the source of truth (set by password signup or by a
  // previous social login below). Absent => this is a first-time social login.
  let role: string | undefined = meta.role

  if (!role) {
    const intended = roleFromNext(next)

    if (intended === 'employer') {
      // The on_auth_user_created trigger defaults social logins to a jobseeker
      // row (no role in Google metadata). Convert to a PENDING employer:
      // remove the default jobseeker row and create the employer profile
      // (employers.account_status defaults to 'pending').
      await supabaseAdmin.from('jobseekers').delete().eq('id', user.id)
      await supabaseAdmin.from('employers').upsert(
        {
          id: user.id,
          email: user.email,
          establishment_name: meta.full_name || meta.name || 'Unnamed Employer',
          contact_person: meta.full_name || meta.name || '',
          password_hash: 'auth_managed',
        },
        { onConflict: 'id' }
      )
      role = 'employer'
    } else {
      role = 'jobseeker'
    }

    // Persist the role on the auth user, then refresh the session so the new
    // role lands in the JWT claims (middleware/layouts read it from there).
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: { ...meta, role },
    })
    await supabase.auth.refreshSession()
  }

  // Route by role. Employers must be approved before reaching the portal.
  if (role === 'employer') {
    const { data: emp } = await supabaseAdmin
      .from('employers')
      .select('account_status')
      .eq('id', user.id)
      .single()

    if (emp?.account_status !== 'approved') {
      return NextResponse.redirect(`${origin}/pending-approval`)
    }
    return NextResponse.redirect(`${origin}/employer/dashboard`)
  }

  if (role === 'admin') {
    return NextResponse.redirect(`${origin}/admin/dashboard`)
  }

  return NextResponse.redirect(`${origin}/jobseeker/dashboard`)
}
