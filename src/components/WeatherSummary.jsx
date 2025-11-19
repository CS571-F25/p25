import React from 'react'

export default function WeatherSummary({ item, city, date }) {
  return (
    <div className="card p-2" style={{ width: 220 }}>
      <div className="card-body">
        <h6 className="card-subtitle mb-2 text-muted">{city} {date ? `· ${date}` : ''}</h6>
        <h5 className="card-title">{item.time} — {item.tempC}°C</h5>
        <p className="card-text">{item.desc}</p>
        <p className="mb-0"><strong>Suggested:</strong> {item.suggestion}</p>
      </div>
    </div>
  )
}
