import { useState } from 'react'

const DISMISSED_KEY = 'ml_migration_dismissed'

export function MigrationBanner({ count, onMigrate, onDismiss }) {
  const [migrating, setMigrating] = useState(false)

  const handleMigrate = async () => {
    setMigrating(true)
    try {
      await onMigrate()
    } finally {
      setMigrating(false)
    }
  }

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1')
    onDismiss()
  }

  return (
    <div className="migration-banner">
      <p>
        You have {count} saved {count === 1 ? 'song' : 'songs'} locally.
        Import {count === 1 ? 'it' : 'them'} to your account?
      </p>
      <div className="migration-banner__actions">
        <button
          className={`migration-banner__btn migration-banner__btn--primary${migrating ? ' migration-banner__btn--loading' : ''}`}
          onClick={handleMigrate}
          disabled={migrating}
        >
          {migrating ? '' : 'Import'}
        </button>
        <button
          className="migration-banner__btn"
          onClick={handleDismiss}
          disabled={migrating}
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
