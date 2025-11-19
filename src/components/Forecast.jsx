import React, { useState } from 'react'
import WeatherSummary from './WeatherSummary'

function formatDateOnly(dt) {
  const d = new Date(dt * 1000)
  // yyyy-mm-dd
  return d.toISOString().slice(0, 10)
}

export default function Forecast() {
  const [city, setCity] = useState('New York')
  const [date, setDate] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rawData, setRawData] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [showRaw, setShowRaw] = useState(false)
  const [testStatus, setTestStatus] = useState('')
  const [testResponse, setTestResponse] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setResults([])

    //const keyHard = 'be696810a79144c9901124327251911'
    //const key = import.meta.env.VITE_WEATHERAPI_KEY //|| keyHard
    const key='be696810a79144c9901124327251911';    //hardcoded key for testing
    if (!key) {
      setError('WeatherAPI key not found. Set VITE_WEATHERAPI_KEY in a .env file or provide a key.')
      return
    }

    if (!city) {
      setError('Please enter a city name.')
      return
    }

    setLoading(true)
    try {
      // Call WeatherAPI's forecast endpoint (returns days with hourly entries)
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${encodeURIComponent(city)}&days=3&aqi=no&alerts=no`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`API error ${res.status}`)
      const data = await res.json()

      // data.forecast.forecastday is an array of days; each has an `hour` array.
      const days = (data.forecast && data.forecast.forecastday) || []

      // If user selected a date, pick that day's hours; otherwise take first day's hours (or first available)
      let hours = []
      if (date) {
        const day = days.find(d => d.date === date)
        hours = day ? day.hour : []
      } else if (days.length > 0) {
        hours = days[0].hour || []
      }

      // Limit to first 6 entries for brevity
      const filtered = hours.slice(0, 6)

      const mapped = filtered.map(item => ({
        id: String(item.time_epoch),
        time: item.time.split(' ')[1] || item.time,
        tempC: Math.round(item.temp_c),
        desc: item.condition && item.condition.text ? item.condition.text : '',
        suggestion: (item.condition && /rain/i.test(item.condition.text)) ? 'Raincoat' : (item.temp_c < 12 ? 'Jacket' : 'Light top')
      }))

      setRawData(data)
      setLastUpdated(new Date().toISOString())
      setResults(mapped)
    } catch (err) {
      setError(err.message || 'Failed to fetch forecast')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Forecast</h1>
      <p>Get a forecast summary for a city and date (real data from WeatherAPI).</p>

      <div className="mb-3">
        <strong>Debug:</strong>
        <div>Component mounted: <code>Forecast</code></div>
        <div>API key present: <strong>{(import.meta.env.VITE_WEATHERAPI_KEY || 'embedded') ? 'yes' : 'no'}</strong></div>
        <div>Last action status: <strong>{error ? `error: ${error}` : (results.length ? `ok (${results.length})` : (testStatus || 'idle'))}</strong></div>
        <div className="mt-2">
          <button className="btn btn-sm btn-outline-secondary me-2" onClick={async () => {
            // quick test fetch to help debug connectivity
            setTestStatus('testing...')
            setTestResponse(null)
            setError('')
            try {
              const keyHard = 'be696810a79144c9901124327251911'
              const key = import.meta.env.VITE_WEATHERAPI_KEY || keyHard
              if (!key) throw new Error('no key')
              const url = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${encodeURIComponent(city || 'New York')}&days=1&aqi=no&alerts=no`
              const r = await fetch(url)
              setTestStatus(`${r.status} ${r.statusText}`)
              const j = await r.json()
              setTestResponse(j)
            } catch (e) {
              setTestStatus(`failed: ${e.message}`)
            }
          }}>Test fetch</button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => { setRawData(null); setResults([]); setError(''); setTestStatus(''); setTestResponse(null); setLastUpdated(null); }}>Clear</button>
        </div>
        {testResponse && <pre className="mt-2 border rounded p-2" style={{ maxHeight: 180, overflow: 'auto' }}>{JSON.stringify(testResponse, null, 2)}</pre>}
      </div>
      <form className="row g-2 align-items-end mb-3" onSubmit={submit}>
        <div className="col-sm-5">
          <label className="form-label">City</label>
          <input className="form-control" value={city} onChange={e => setCity(e.target.value)} />
        </div>
        <div className="col-sm-4">
          <label className="form-label">Date</label>
          <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="col-sm-3">
          <button className="btn btn-primary w-100" type="submit" disabled={loading}>{loading ? 'Loading…' : 'Show Forecast'}</button>
        </div>
      </form>

      {error && <div className="alert alert-danger">{error}</div>}

      {results.length > 0 ? (
        <div>
          <div className="alert alert-success">
            Retrieved <strong>{results.length}</strong> forecast entr{results.length === 1 ? 'y' : 'ies'}{lastUpdated ? ` · last updated ${new Date(lastUpdated).toLocaleString()}` : ''}.
            <button className="btn btn-sm btn-link ms-3" onClick={() => setShowRaw(s => !s)}>{showRaw ? 'Hide raw' : 'Show raw'}</button>
          </div>

          {showRaw && rawData && (
            <pre className="border rounded p-2 bg-light" style={{ maxHeight: 300, overflow: 'auto' }}>
              {JSON.stringify(rawData, null, 2)}
            </pre>
          )}

          <div className="d-flex flex-wrap gap-3">
            {results.map(r => (
              <WeatherSummary key={r.id} item={r} city={city} date={date} />
            ))}
          </div>
        </div>
      ) : (
        <div className="alert alert-secondary">No forecast data to display. Submit the form to fetch data.</div>
      )}
    </div>
  )
}
