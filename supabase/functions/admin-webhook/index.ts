import { withSupabase } from "@supabase/server"

export default {
  // Use "secret" auth mode for admin/backend webhooks that bypass RLS
  fetch: withSupabase({ auth: "secret" }, async (_req, ctx) => {
    // ctx.supabaseAdmin is an authenticated client that bypasses RLS
    const { data, error } = await ctx.supabaseAdmin.from("todos").select("*")
    
    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json({ message: "Admin data fetched successfully", data })
  }),
}
