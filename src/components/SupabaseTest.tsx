import { useSupabaseConnection } from '../hooks/useSupabaseConnection'

export function SupabaseTest() {
  const { isConnected, error } = useSupabaseConnection()

  if (isConnected === null) {
    return <div className="text-text-secondary">연결 테스트 중...</div>
  }

  if (error) {
    return (
      <div className="text-error">
        <p>데이터베이스 연결 실패:</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="text-success">
      ✅ Supabase 데이터베이스 연결 성공!
    </div>
  )
}