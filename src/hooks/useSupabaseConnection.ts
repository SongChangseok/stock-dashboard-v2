import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useSupabaseConnection() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        // Simple query to test database connection
        const { error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1)

        if (error) {
          setError(error.message)
          setIsConnected(false)
        } else {
          setIsConnected(true)
          setError(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setIsConnected(false)
      }
    }

    testConnection()
  }, [])

  return { isConnected, error }
}