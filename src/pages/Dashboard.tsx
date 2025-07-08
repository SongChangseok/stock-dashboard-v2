import { useAuth } from '../hooks'
import { Button } from '../components/ui'

export const Dashboard = () => {
  const { user, profile, signOut } = useAuth()
  
  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('로그아웃 실패:', error)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-white">
              주식 포트폴리오 대시보드
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">
                안녕하세요, {profile?.full_name || user?.email}님
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
              >
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            대시보드
          </h2>
          <p className="text-gray-400">
            환영합니다! 여기서 주식 포트폴리오를 관리할 수 있습니다.
          </p>
        </div>
      </main>
    </div>
  )
}