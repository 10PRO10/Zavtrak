import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// 🔴 ПРОВЕРКА ПЕРЕД СОЗДАНИЕМ КЛИЕНТА
console.log('🔍 ENV CHECK ON BUILD:')
console.log('URL:', supabaseUrl)
console.log('Key exists:', !!supabaseKey)

if (!supabaseUrl) {
  console.error('❌ ОШИБКА: REACT_APP_SUPABASE_URL не найден!')
  console.error('Доступные переменные:', Object.keys(process.env).filter(k => k.includes('SUPABASE')))
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  storage: {
    timeout: 300000,
    retryAttempts: 3,
  },
  db: {
    schema: 'public'
  }
})