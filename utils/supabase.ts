
import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabase = createClient('https://iudufbrynkxnpyhvrlwc.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1ZHVmYnJ5bmt4bnB5aHZybHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc1MDE4NzksImV4cCI6MjAyMzA3Nzg3OX0.8aCuCkiP-uHlfGM0QMT3yXGYFhyzaHEp-3qiclEb2_k');

export default supabase