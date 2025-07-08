import { useState } from 'react'
import { useAuth } from '../../hooks'
import { Button, Input } from '../ui'

interface LoginFormProps {
  onToggleMode: () => void
}

export const LoginForm = ({ onToggleMode }: LoginFormProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useAuth()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await signIn(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          로그인
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="이메일"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력하세요"
            required
          />
          
          <Input
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            required
          />
          
          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}
          
          <Button
            type="submit"
            loading={loading}
            className="w-full"
            disabled={!email || !password}
          >
            로그인
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            계정이 없으신가요?{' '}
            <button
              onClick={onToggleMode}
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              회원가입
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}