import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://neaxbgezlifwgjfbomom.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lYXhiZ2V6bGlmd2dqZmJvbW9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MTk3NzIsImV4cCI6MjA4ODM5NTc3Mn0.uSKw4XA1_dLnzuVzjVcc0TOpiRigrDrnTJDGbXHF_f4'

export const supabase = createClient(supabaseUrl, supabaseKey)