import { useState } from 'react'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'

export const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true)
  
  const toggleMode = () => {
    setIsLogin(!isLogin)
  }
  
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      {isLogin ? (
        <LoginForm onToggleMode={toggleMode} />
      ) : (
        <SignupForm onToggleMode={toggleMode} />
      )}
    </div>
  )
}