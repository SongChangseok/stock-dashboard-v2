import { SupabaseTest } from './components/SupabaseTest'

function App() {
  return (
    <div className="min-h-screen bg-background-primary text-text-primary p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-8">
          Stock Dashboard
        </h1>
        
        <div className="bg-background-secondary p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">데이터베이스 연결 상태</h2>
          <SupabaseTest />
        </div>
      </div>
    </div>
  )
}

export default App
