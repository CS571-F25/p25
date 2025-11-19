import React, { useEffect, useState } from 'react'
import ClothingCard from './ClothingCard'

export default function Basket() {
  const [items, setItems] = useState([])

  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem('savedItems') || '[]')
      setItems(list)
    } catch {
      setItems([])
    }
  }, [])

  function clearAll() {
    localStorage.removeItem('savedItems')
    setItems([])
  }

  return (
    <div>
      <h1>Basket</h1>
      <p>Saved clothing items are stored in your browser.</p>
      {items.length === 0 && <div className="alert alert-secondary">No saved items yet.</div>}
      <div className="d-flex flex-wrap gap-3">
        {items.map(item => (
          <ClothingCard key={item.id} item={item} />
        ))}
      </div>
      {items.length > 0 && (
        <div className="mt-3">
          <button className="btn btn-danger" onClick={clearAll}>Clear Basket</button>
        </div>
      )}
    </div>
  )
}
