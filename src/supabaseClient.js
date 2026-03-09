import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://твой-проект.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'твой-ключ'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  storage: {
    timeout: 300000,
    retryAttempts: 3,
  },
})