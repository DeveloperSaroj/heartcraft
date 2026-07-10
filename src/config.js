// Supabase project settings — from supabase.com → your project → Settings → API.
// Leave both empty to run in pure URL-mode (no database, links carry the data).
export const SUPABASE_URL = 'https://eibreokmdskbeyotheav.supabase.co'
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpYnJlb2ttZHNrYmV5b3RoZWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2NjUzMzEsImV4cCI6MjA5OTI0MTMzMX0.y2wglGS1y6jSb4przDu78ktP3CIGNfOKv-5koTsYohg'

export const supabaseEnabled = () => !!(SUPABASE_URL && SUPABASE_ANON_KEY)
