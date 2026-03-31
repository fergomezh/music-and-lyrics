import { useState } from 'react'
import { Search, Loader } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext.jsx'

export function SearchBar() {
  const { search, searchLoading } = usePlayer()
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) search(query.trim())
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-bar__input-wrap">
        <label htmlFor="search-input" className="search-bar__btn" style={{ cursor: 'default' }}>
          {searchLoading ? <Loader size={15} className="spinner" /> : <Search size={15} />}
        </label>
        <input
          id="search-input"
          className="search-bar__input"
          type="text"
          placeholder="Search songs, artists…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          disabled={searchLoading}
          autoComplete="off"
        />
      </div>
    </form>
  )
}