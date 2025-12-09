// src/components/pages/RecommendationsPage.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Alert,
  Button,
  Col,
  Form,
  Row
} from "react-bootstrap";
import ClothingCard from "../wardrobe/ClothingCard";
import WeatherHero from "../weather/WeatherHero";
import clothingData from '../../data/clothing.json'

export default function RecommendationsPage() {
  const navigate = useNavigate()
  
  const LS_KEYS = {
    location: 'wsw-location',
    date: 'wsw-date',
    filter: 'wsw-filter-category',
    submitted: 'wsw-has-submitted',
    weather: 'wsw-weather-snapshot',
    recs: 'wsw-recommendation-ids'
  }
  
  const [location, setLocation] = useState(localStorage.getItem(LS_KEYS.location) ?? "");
  const [date, setDate] = useState(localStorage.getItem(LS_KEYS.date) ?? "");
  const [recommendations, setRecommendations] = useState([])
  const [savedCount, setSavedCount] = useState(
    JSON.parse(localStorage.getItem("wsw-saved-items") ?? "[]").length
  );
  const [filterCategory, setFilterCategory] = useState("All");
  const [weather, setWeather] = useState(null);
  const [addedMessage, setAddedMessage] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    // Check if user has submitted a search
    const hasSubmitted = localStorage.getItem(LS_KEYS.submitted) === 'true'
    if (!hasSubmitted) {
      // Redirect back to search page if no weather data
      navigate('/')
      return
    }

    // Initialize filter from localStorage if present
    const storedFilter = localStorage.getItem(LS_KEYS.filter)
    if (storedFilter) {
      setFilterCategory(storedFilter)
    }

    // Rehydrate weather and recommendations
    const storedWeather = localStorage.getItem(LS_KEYS.weather)
    const storedRecs = localStorage.getItem(LS_KEYS.recs)
    
    try {
      if (storedWeather) {
        const w = JSON.parse(storedWeather)
        setWeather(w)
      }
    } catch {}
    
    try {
      if (storedRecs) {
        const ids = JSON.parse(storedRecs)
        if (Array.isArray(ids) && ids.length) {
          const items = clothingData.filter(i => ids.includes(i.id))
          setRecommendations(items)
        }
      }
    } catch {}
    
    setHasLoaded(true)
  }, [navigate])

  // Persist filter to localStorage when it changes
  useEffect(() => {
    try {
      if (filterCategory != null) localStorage.setItem(LS_KEYS.filter, filterCategory)
    } catch {}
  }, [filterCategory])

  const handleSaveItem = (item) => {
    const existing = JSON.parse(
      localStorage.getItem("wsw-saved-items") ?? "[]"
    );
    const updated = [...existing, item];
    localStorage.setItem("wsw-saved-items", JSON.stringify(updated));
    setSavedCount(updated.length);

    // Remove item from recommendations so it doesn't show
    setRecommendations(prev => prev.filter(i => i.id !== item.id))

    // show "added to cart" message
    setAddedMessage(`You have added ${item.name} to cart!`);
    setTimeout(() => {
      setAddedMessage(null);
    }, 3000);
  };

  const visibleItems = filterCategory === "All" 
    ? recommendations 
    : recommendations.filter(item => item.category === filterCategory)

  if (!hasLoaded) {
    return <div>Loading...</div>
  }

  return (
    <div>
      {/* Full-width weather banner at the top */}
      <WeatherHero
        {...{
          hasSubmitted: true,
          location,
          date,
          weather
        }}
      />

      {/* Filter + basket count + back button */}
      <Row className="mb-3 mt-2">
        <Col xs={12} md={6}>
          <Form.Label htmlFor="category">Filter by category</Form.Label>
          <Form.Select
            id="category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Outerwear">Outerwear</option>
            <option value="Top">Top</option>
            <option value="Bottom">Bottom</option>
          </Form.Select>
        </Col>
        <Col xs={12} md={6} className="d-flex flex-column justify-content-end gap-2">
          <div className="text-md-end fw-semibold">
            Saved items in basket: {savedCount}
          </div>
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => navigate('/')}
            className="align-self-md-end"
          >
            ← Back to Search
          </Button>
        </Col>
      </Row>

      {/* small auto-dismiss success message when adding to basket */}
      {addedMessage && (
        <Alert variant="success" className="py-2">
          {addedMessage}
        </Alert>
      )}

      {/* Clothing recommendations list */}
      <Row className="mt-3 g-3">
        {visibleItems.length > 0 ? (
          visibleItems.map((item) => (
            <Col key={item.id} xs={12} md={6} lg={4}>
              <ClothingCard
                {...{
                  item,
                  onSave: handleSaveItem
                }}
              />
            </Col>
          ))
        ) : (
          <Col xs={12}>
            <Alert variant="info">
              No recommendations available. Please go back and try a different location or date.
            </Alert>
          </Col>
        )}
      </Row>
    </div>
  );
}
