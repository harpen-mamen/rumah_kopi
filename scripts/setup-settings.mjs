import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://psbrrnywovygnmwnmeaq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzYnJybnl3b3Z5Z25td25tZWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NjA1NTAsImV4cCI6MjA5MDAzNjU1MH0._nebmG87pSc5Cildoy-s4EEe5pVrDzN7j9TDYhJvHEc'
)

// Test inserting into settings table
const { error } = await supabase.from('settings').insert({ key: 'admin_password', value: 'admin' })
if (error) {
  console.log('Table does not exist or error:', error.message)
} else {
  console.log('Settings table ready!')
}
