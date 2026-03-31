import { LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

function initials(email) {
  if (!email) return '?'
  const [local] = email.split('@')
  const parts = local.split(/[._-]/)
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : local.slice(0, 2).toUpperCase()
}

export function UserWidget({ onOpenAuth }) {
  const { user, signOut } = useAuth()

  if (!user) {
    return (
      <div className="user-widget">
        <button className="user-widget__signin" onClick={onOpenAuth}>
          Sign In / Register
        </button>
      </div>
    )
  }

  return (
    <div className="user-widget user-widget--authed">
      <div className="user-widget__avatar" aria-hidden="true">
        {initials(user.email)}
      </div>
      <div className="user-widget__email" title={user.email}>
        {user.email}
      </div>
      <button
        className="user-widget__signout"
        onClick={signOut}
        title="Sign out"
        aria-label="Sign out"
      >
        <LogOut size={16} />
      </button>
    </div>
  )
}
