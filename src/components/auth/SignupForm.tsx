import { useState } from 'react'
import { useAuth } from '../../hooks'
import { Button, Input } from '../ui'

interface SignupFormProps {
  onToggleMode: () => void
}

export const SignupForm = ({ onToggleMode }: SignupFormProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signUp } = useAuth()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }
    
    setLoading(true)
    
    try {
      await signUp(email, password, fullName)
      alert('회원가입이 완료되었습니다. 이메일을 확인해주세요.')
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          회원가입
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="이름"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="이름을 입력하세요"
          />
          
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
            placeholder="비밀번호를 입력하세요 (6자 이상)"
            required
          />
          
          <Input
            label="비밀번호 확인"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호를 다시 입력하세요"
            required
          />
          
          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}
          
          <Button
            type="submit"
            loading={loading}
            className="w-full"
            disabled={!email || !password || !confirmPassword}
          >
            회원가입
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            이미 계정이 있으신가요?{' '}
            <button
              onClick={onToggleMode}
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              로그인
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}