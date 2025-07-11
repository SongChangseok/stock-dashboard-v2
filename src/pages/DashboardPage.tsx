import { useAuth } from '../hooks'

export const DashboardPage: React.FC = () => {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              StockDash
            </h1>
            <p className="text-gray-400 mt-1">포트폴리오 대시보드</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">환영합니다!</p>
              <p className="text-white font-medium">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Overview */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              포트폴리오 개요
            </h2>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <p className="text-gray-400 mb-2">포트폴리오 데이터가 없습니다</p>
              <p className="text-sm text-gray-500">
                주식을 추가하여 포트폴리오를 시작해보세요
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                빠른 액션
              </h3>
              <div className="space-y-3">
                <button className="w-full py-3 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-lg hover:bg-indigo-500/30 transition-all duration-300">
                  주식 추가
                </button>
                <button className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all duration-300">
                  포트폴리오 분석
                </button>
                <button className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all duration-300">
                  시장 동향
                </button>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                계정 정보
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">이메일</span>
                  <span className="text-white text-sm">{user?.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">가입일</span>
                  <span className="text-white text-sm">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString('ko-KR')
                      : '알 수 없음'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
