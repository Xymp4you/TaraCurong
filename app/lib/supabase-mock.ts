// In-memory mock of the Supabase client surface used across the app.
// Returns chainable query builders backed by demo-data.ts so pages can
// render without a real database.

import { getTableRows } from "./demo-data"
import { DEMO_ROLE_COOKIE, DEMO_USERS, DemoRole } from "./demo-mode"

type Filter = { op: string; column: string; value: any }

type SessionUser = {
  id: string
  email: string
  user_metadata: Record<string, any>
  app_metadata: Record<string, any>
  aud: string
  created_at: string
}

const readCookieRole = (override?: DemoRole | null): DemoRole | null => {
  if (override) return override
  if (typeof document === "undefined") return null
  const match = document.cookie.split("; ").find(c => c.startsWith(`${DEMO_ROLE_COOKIE}=`))
  if (!match) return null
  const value = decodeURIComponent(match.split("=")[1]) as DemoRole
  return ["admin", "employer", "jobseeker"].includes(value) ? value : null
}

const writeCookieRole = (role: DemoRole | null) => {
  if (typeof document === "undefined") return
  if (role) {
    document.cookie = `${DEMO_ROLE_COOKIE}=${encodeURIComponent(role)}; path=/; max-age=86400`
  } else {
    document.cookie = `${DEMO_ROLE_COOKIE}=; path=/; max-age=0`
  }
}

const buildUser = (role: DemoRole): SessionUser => {
  const u = DEMO_USERS[role]
  return {
    id: u.id,
    email: u.email,
    user_metadata: { role, full_name: u.name, name: u.name },
    app_metadata: { role },
    aud: "authenticated",
    created_at: new Date(0).toISOString(),
  }
}

const buildSession = (user: SessionUser) => ({
  access_token: "demo-token",
  refresh_token: "demo-refresh",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: "bearer",
  user,
})

const matchesFilters = (row: any, filters: Filter[]): boolean => {
  return filters.every(f => {
    const v = row?.[f.column]
    switch (f.op) {
      case "eq": return v === f.value
      case "neq": return v !== f.value
      case "gt": return v > f.value
      case "gte": return v >= f.value
      case "lt": return v < f.value
      case "lte": return v <= f.value
      case "in": return Array.isArray(f.value) && f.value.includes(v)
      case "is": return v === f.value || (f.value === null && (v === null || v === undefined))
      case "like":
      case "ilike": {
        const pattern = String(f.value).replace(/%/g, ".*")
        return new RegExp(pattern, f.op === "ilike" ? "i" : "").test(String(v ?? ""))
      }
      default: return true
    }
  })
}

class QueryBuilder<T = any> implements PromiseLike<{ data: T | null; error: null; count: number | null }> {
  private filters: Filter[] = []
  private _orderBy: { column: string; ascending: boolean } | null = null
  private _limit: number | null = null
  private _range: { from: number; to: number } | null = null
  private _single = false
  private _maybeSingle = false
  private _mode: "select" | "insert" | "update" | "delete" | "upsert" = "select"
  private _payload: any = null

  constructor(private table: string) {}

  select(_cols?: string, opts?: { count?: string; head?: boolean }) {
    this._mode = "select"
    if (opts?.head) this._limit = 0
    return this
  }
  insert(payload: any) { this._mode = "insert"; this._payload = payload; return this }
  update(payload: any) { this._mode = "update"; this._payload = payload; return this }
  upsert(payload: any) { this._mode = "upsert"; this._payload = payload; return this }
  delete() { this._mode = "delete"; return this }

  eq(column: string, value: any) { this.filters.push({ op: "eq", column, value }); return this }
  neq(column: string, value: any) { this.filters.push({ op: "neq", column, value }); return this }
  gt(column: string, value: any) { this.filters.push({ op: "gt", column, value }); return this }
  gte(column: string, value: any) { this.filters.push({ op: "gte", column, value }); return this }
  lt(column: string, value: any) { this.filters.push({ op: "lt", column, value }); return this }
  lte(column: string, value: any) { this.filters.push({ op: "lte", column, value }); return this }
  in(column: string, values: any[]) { this.filters.push({ op: "in", column, value: values }); return this }
  is(column: string, value: any) { this.filters.push({ op: "is", column, value }); return this }
  like(column: string, value: any) { this.filters.push({ op: "like", column, value }); return this }
  ilike(column: string, value: any) { this.filters.push({ op: "ilike", column, value }); return this }
  contains(_column: string, _value: any) { return this }
  containedBy(_column: string, _value: any) { return this }
  match(query: Record<string, any>) {
    for (const k of Object.keys(query)) this.filters.push({ op: "eq", column: k, value: query[k] })
    return this
  }
  not(column: string, op: string, value: any) {
    // Approximate: just don't apply. Good enough for demo.
    return this
  }
  or(_expr: string) { return this }
  filter(_column: string, _op: string, _value: any) { return this }
  order(column: string, opts?: { ascending?: boolean }) {
    this._orderBy = { column, ascending: opts?.ascending !== false }
    return this
  }
  limit(n: number) { this._limit = n; return this }
  range(from: number, to: number) { this._range = { from, to }; return this }
  single() { this._single = true; return this }
  maybeSingle() { this._maybeSingle = true; return this }
  returns() { return this }

  private resolve(): { data: any; error: null; count: number | null } {
    let rows = [...getTableRows(this.table)]

    if (this._mode === "insert" || this._mode === "upsert") {
      const items = Array.isArray(this._payload) ? this._payload : [this._payload]
      const inserted = items.map(item => ({ id: `mock-${Math.random().toString(36).slice(2, 9)}`, created_at: new Date().toISOString(), ...item }))
      return { data: this._single ? inserted[0] : inserted, error: null, count: inserted.length }
    }

    rows = rows.filter(r => matchesFilters(r, this.filters))

    if (this._mode === "update") {
      const updated = rows.map(r => ({ ...r, ...this._payload, updated_at: new Date().toISOString() }))
      return { data: this._single ? updated[0] ?? null : updated, error: null, count: updated.length }
    }
    if (this._mode === "delete") {
      return { data: this._single ? rows[0] ?? null : rows, error: null, count: rows.length }
    }

    if (this._orderBy) {
      const { column, ascending } = this._orderBy
      rows.sort((a, b) => {
        const av = a?.[column]
        const bv = b?.[column]
        if (av === bv) return 0
        if (av == null) return 1
        if (bv == null) return -1
        return (av < bv ? -1 : 1) * (ascending ? 1 : -1)
      })
    }

    const count = rows.length

    if (this._range) rows = rows.slice(this._range.from, this._range.to + 1)
    else if (this._limit !== null) rows = rows.slice(0, this._limit)

    if (this._single) return { data: rows[0] ?? null, error: null, count }
    if (this._maybeSingle) return { data: rows[0] ?? null, error: null, count }
    return { data: rows, error: null, count }
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: T | null; error: null; count: number | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    try {
      const result = this.resolve()
      return Promise.resolve(result as any).then(onfulfilled, onrejected)
    } catch (e) {
      return Promise.reject(e).then(onfulfilled, onrejected) as any
    }
  }
}

const authListeners: Array<(event: string, session: any) => void> = []

const makeAuth = (serverRole?: DemoRole | null) => ({
  async getUser() {
    const role = readCookieRole(serverRole)
    if (!role) return { data: { user: null }, error: null }
    return { data: { user: buildUser(role) }, error: null }
  },
  async getSession() {
    const role = readCookieRole(serverRole)
    if (!role) return { data: { session: null }, error: null }
    const user = buildUser(role)
    return { data: { session: buildSession(user) }, error: null }
  },
  async signInWithPassword({ email }: { email: string; password: string }) {
    // Map email to role by simple heuristic so any login form just works.
    const role: DemoRole = email.includes("admin") ? "admin" : email.includes("employer") ? "employer" : "jobseeker"
    writeCookieRole(role)
    const user = buildUser(role)
    const session = buildSession(user)
    authListeners.forEach(l => l("SIGNED_IN", session))
    return { data: { user, session }, error: null }
  },
  async signUp({ email, options }: { email: string; password: string; options?: { data?: any } }) {
    const role: DemoRole = options?.data?.role ?? (email.includes("admin") ? "admin" : email.includes("employer") ? "employer" : "jobseeker")
    writeCookieRole(role)
    const user = buildUser(role)
    const session = buildSession(user)
    authListeners.forEach(l => l("SIGNED_IN", session))
    return { data: { user, session }, error: null }
  },
  async signInWithOAuth() {
    writeCookieRole("jobseeker")
    return { data: { provider: "google", url: "/jobseeker/dashboard" }, error: null }
  },
  async signOut() {
    writeCookieRole(null)
    authListeners.forEach(l => l("SIGNED_OUT", null))
    return { error: null }
  },
  async resetPasswordForEmail() { return { data: {}, error: null } },
  async updateUser() { return { data: { user: null }, error: null } },
  async verifyOtp() { return { data: { user: null, session: null }, error: null } },
  onAuthStateChange(cb: (event: string, session: any) => void) {
    authListeners.push(cb)
    // Fire current state on next tick
    queueMicrotask(() => {
      const role = readCookieRole()
      if (role) cb("SIGNED_IN", buildSession(buildUser(role)))
      else cb("SIGNED_OUT", null)
    })
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const idx = authListeners.indexOf(cb)
            if (idx >= 0) authListeners.splice(idx, 1)
          },
        },
      },
    }
  },
  async exchangeCodeForSession() {
    writeCookieRole("jobseeker")
    const user = buildUser("jobseeker")
    return { data: { session: buildSession(user), user }, error: null }
  },
})

const storage = {
  from(_bucket: string) {
    return {
      async upload(path: string) { return { data: { path }, error: null } },
      async download() { return { data: new Blob(), error: null } },
      async remove() { return { data: [], error: null } },
      async list() { return { data: [], error: null } },
      getPublicUrl(path: string) { return { data: { publicUrl: `/demo-storage/${path}` } } },
      async createSignedUrl(path: string) { return { data: { signedUrl: `/demo-storage/${path}` }, error: null } },
    }
  },
}

export const createMockSupabaseClient = (opts?: { role?: DemoRole | null }): any => ({
  from: (table: string) => new QueryBuilder(table),
  auth: makeAuth(opts?.role ?? null),
  storage,
  async rpc(_fn: string, _args?: any) { return { data: null, error: null } },
  channel(_name: string) {
    return {
      on() { return this },
      subscribe() { return this },
      unsubscribe() { return Promise.resolve("ok") },
    }
  },
  removeChannel() { return Promise.resolve("ok") },
  removeAllChannels() { return Promise.resolve("ok") },
})

// Server-side role reader. Imported by the middleware shim — kept here
// so both client and server paths agree on the cookie format.
export const readServerCookieRole = (cookieValue: string | undefined): DemoRole | null => {
  if (!cookieValue) return null
  const decoded = decodeURIComponent(cookieValue) as DemoRole
  return ["admin", "employer", "jobseeker"].includes(decoded) ? decoded : null
}

export const buildServerUser = (role: DemoRole): SessionUser => buildUser(role)
