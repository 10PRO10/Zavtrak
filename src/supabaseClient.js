import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// 🔴 Оптимизированные настройки клиента
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  storage: {
    timeout: 300000, // 5 минут для больших файлов
    retryAttempts: 3,
  },
  db: {
    schema: 'public'
  }
})