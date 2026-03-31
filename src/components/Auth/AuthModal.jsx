import { useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

export function AuthModal({ onClose, onSignedIn }) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [signupDone, setSignupDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await signUp(email, password)
      setLoading(false)
      if (error) { setError(error.message); return }
      setSignupDone(true)
    } else {
      const { error } = await signIn(email, password)
      setLoading(false)
      if (error) { setError(error.message); return }
      onSignedIn?.()
      onClose()
    }
  }

  const switchMode = (next) => {
    setMode(next)
    setError('')
    setSignupDone(false)
  }

  return (
    <div className="auth-modal__overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="auth-modal__close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="auth-modal__title">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </div>

        <div className="auth-modal__tabs">
          <button
            className={`auth-modal__tab${mode === 'signin' ? ' auth-modal__tab--active' : ''}`}
            onClick={() => switchMode('signin')}
          >
            Sign In
          </button>
          <button
            className={`auth-modal__tab${mode === 'signup' ? ' auth-modal__tab--active' : ''}`}
            onClick={() => switchMode('signup')}
          >
            Register
          </button>
        </div>

        {signupDone ? (
          <div className="auth-modal__confirm">
            <p>Check your email to confirm your account, then sign in.</p>
            <button className="auth-form__submit" onClick={() => switchMode('signin')}>
              Go to Sign In
            </button>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div>
              <label className="auth-form__label" htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                className="auth-form__input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="auth-form__label" htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                className="auth-form__input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>
            {error && <p className="auth-form__error">{error}</p>}
            <button
              className={`auth-form__submit${loading ? ' auth-form__submit--loading' : ''}`}
              type="submit"
              disabled={loading}
            >
              {loading ? '' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
