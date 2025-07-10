import { useState } from 'react'
import './App.css'
import DatabaseTest from './components/DatabaseTest'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Stock Dashboard</h1>
        
        <div className="mb-8">
          <DatabaseTest />
        </div>
        
        <div className="text-center">
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setCount((count) => count + 1)}
          >
            count is {count}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
