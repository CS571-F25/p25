import React, { useState } from 'react'

export default function ClothingCard({ item }) {
  const [saved, setSaved] = useState(() => {
    try {
      const list = JSON.parse(localStorage.getItem('savedItems') || '[]')
      return list.some(i => i.id === item.id)
    } catch {
      return false
    }
  })

  function toggleSave() {
    const raw = localStorage.getItem('savedItems') || '[]'
    const list = JSON.parse(raw)
    if (saved) {
      const next = list.filter(i => i.id !== item.id)
      localStorage.setItem('savedItems', JSON.stringify(next))
      setSaved(false)
    } else {
      list.push(item)
      localStorage.setItem('savedItems', JSON.stringify(list))
      setSaved(true)
    }
  }

  return (
    <div className="card" style={{ width: '18rem' }}>
      {item.image && <img src={item.image} className="card-img-top" alt={item.title} />}
      <div className="card-body">
        <h5 className="card-title">{item.title}</h5>
        <p className="card-text">{item.description}</p>
        <div className="d-flex justify-content-between align-items-center">
          <button className={`btn ${saved ? 'btn-success' : 'btn-outline-primary'}`} onClick={toggleSave}>
            {saved ? 'Saved' : 'Save'}
          </button>
          <a className="btn btn-link" href={item.link || '#'} target="_blank" rel="noreferrer">Buy</a>
        </div>
      </div>
    </div>
  )
}
