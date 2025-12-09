// src/components/pages/LandingPage.jsx

import { useState, useEffect } from "react";
import {
  Alert,
  Button,
  Col,
  Form,
  Row
} from "react-bootstrap";
import ClothingCard from "../wardrobe/ClothingCard";
import LocationSearch from '../LocationSearch'
import WeatherHero from "../weather/WeatherHero";
import clothingData from '../../data/clothing.json'

function formatLocalDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const today = new Date()
const minDate = formatLocalDate(today)
const maxDateObj = new Date(today)
maxDateObj.setDate(today.getDate() + 7)
const maxDate = formatLocalDate(maxDateObj)


export default function LandingPage() {
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
  const [loadingWeather, setLoadingWeather] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [fetchError, setFetchError] = useState('')
  const [rawResponse, setRawResponse] = useState(null)
  const [hasSubmitted, setHasSubmitted] = useState(() => {
    const v = localStorage.getItem(LS_KEYS.submitted)
    return v === 'true'
  });
  const [savedCount, setSavedCount] = useState(
    JSON.parse(localStorage.getItem("wsw-saved-items") ?? "[]").length
  );
  const [filterCategory, setFilterCategory] = useState("All");
  const [weather, setWeather] = useState(null);
  const [addedMessage, setAddedMessage] = useState(null);

  // Log setter type on mount to help diagnose transient issues
  useEffect(() => {
    try {
      console.log('LandingPage mounted: typeof setLoadingWeather =', typeof setLoadingWeather, 'value=', setLoadingWeather)
    } catch (err) {
      console.warn('LandingPage mount: cannot inspect setLoadingWeather', err)
    }
    // Initialize filter from localStorage if present
    const storedFilter = localStorage.getItem(LS_KEYS.filter)
    if (storedFilter) {
      setFilterCategory(storedFilter)
    }

    // Rehydrate weather and recommendations when returning
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
  }, [])

  // Persist location, date, and filter to localStorage when they change
  useEffect(() => {
    try {
      if (location != null) localStorage.setItem(LS_KEYS.location, location)
    } catch {}
  }, [location])
  useEffect(() => {
    try {
      if (date != null) localStorage.setItem(LS_KEYS.date, date)
    } catch {}
  }, [date])
  useEffect(() => {
    try {
      if (filterCategory != null) localStorage.setItem(LS_KEYS.filter, filterCategory)
    } catch {}
  }, [filterCategory])
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.submitted, hasSubmitted ? 'true' : 'false')
    } catch {}
  }, [hasSubmitted])

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!location || !date) return;

    // Diagnostic: log setter type at submit time
    try {
      console.log('DEBUG submit: typeof setLoadingWeather =', typeof setLoadingWeather, 'value=', setLoadingWeather)
    } catch (err) {
      console.warn('DEBUG submit: could not inspect setLoadingWeather', err)
    }

    // fetch real forecast data from WeatherAPI and derive clothing recommendations
    const key = import.meta.env.VITE_WEATHERAPI_KEY
    if (!key) {
      setFetchError('Weather API key missing. Add VITE_WEATHERAPI_KEY to .env')
      return
    }

    setFetchError('')
    console.log("setLoadingWeather type before call:", typeof setLoadingWeather);
    setLoadingWeather(true);
    console.log("setLoadingWeather type after call:", typeof setLoadingWeather);
    // Diagnostic: inspect setter and current apiLog before updating
      // request submitted

    (async () => {
      try {
        // request forecast for 1 day and use the day matching the selected date (or today)
        const url = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${encodeURIComponent(location)}&days=1&aqi=no&alerts=no`
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Weather API error ${res.status}`)
          // received HTTP status
        console.log(`Received HTTP ${res.status}`)
        const data = await res.json()
        setRawResponse(data)
          // response received
        console.log('Response typeof:', typeof data)
        console.log('Weather API response', data)
        // prepared locals for safer logging and parsing
        let fd0 = null
        let tempC = null
        let conditionText = ''
        let willRain = false
        
        // Extract weather data from API response
        if (data.forecast && data.forecast.forecastday && data.forecast.forecastday.length > 0) {
          const forecastDay = data.forecast.forecastday[0]
          const dayCondition = forecastDay.day
          // WeatherAPI uses avgtemp_c (no underscore). Fallback to current when missing.
          tempC = (typeof dayCondition.avgtemp_c === 'number')
            ? dayCondition.avgtemp_c
            : (data.current && typeof data.current.temp_c === 'number' ? data.current.temp_c : null)
          conditionText = dayCondition.condition && dayCondition.condition.text ? dayCondition.condition.text : (data.current && data.current.condition && data.current.condition.text ? data.current.condition.text : '')
          const chanceOfRain = typeof dayCondition.daily_chance_of_rain === 'number' ? dayCondition.daily_chance_of_rain : (forecastDay.day && typeof forecastDay.day.daily_chance_of_rain === 'number' ? forecastDay.day.daily_chance_of_rain : 0)
          willRain = chanceOfRain > 0
        }
          
        const recs = []
        const t = tempC ?? 20
        // Rain/wet weather recommendations
        if (/rain|shower|drizzle/i.test(conditionText)) {
          recs.push(...clothingData.filter(i => 
            i.weatherTag && /rainy/i.test(i.weatherTag)
          ))
        }
        // Temperature-based recommendations with multiple items per category
        if (t < 0) {
          // Extreme cold: Very Cold weather tag items
          recs.push(...clothingData.filter(i => 
            i.weatherTag && /very cold/i.test(i.weatherTag)
          ))
        } else if (t < 12) {
          // Cold: Cold and Very Cold items
          recs.push(...clothingData.filter(i => 
            i.weatherTag && /cold|very cold/i.test(i.weatherTag)
          ))
        } else if (t < 20) {
          // Cool: Cool and Mild items
          recs.push(...clothingData.filter(i => 
            i.weatherTag && /cool|mild/i.test(i.weatherTag)
          ))
        } else if (t < 25) {
          // Warm: Warm & Sunny items
          recs.push(...clothingData.filter(i => 
            i.weatherTag && /warm|sunny/i.test(i.weatherTag)
          ))
        } else {
          // Hot: Hot and Warm & Sunny items
          recs.push(...clothingData.filter(i => 
            i.weatherTag && /hot|warm|sunny/i.test(i.weatherTag)
          ))
        }
        
        // Add versatile all-purpose items
        recs.push(...clothingData.filter(i => 
          i.weatherTag && /all-purpose/i.test(i.weatherTag)
        ))

        // filter undefined and dedupe
        const flat = recs.filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i)

        const detail = (() => {
          const current = data && data.current ? data.current : null
          const humidity = current && typeof current.humidity === 'number' ? `${current.humidity}% humidity` : null
          const wind = current && typeof current.wind_kph === 'number' ? `${current.wind_kph} kph wind` : null
          const rainChance = typeof (data?.forecast?.forecastday?.[0]?.day?.daily_chance_of_rain) === 'number' ? `${data.forecast.forecastday[0].day.daily_chance_of_rain}% chance of rain` : (willRain ? 'Chance of rain' : null)
          return [humidity, wind, rainChance].filter(Boolean).join(' · ')
        })()

        const tempF = (tempC != null) ? (tempC * 9/5 + 32) : (data?.current?.temp_f ?? null)
        const feelsLikeF = data?.current?.feelslike_f ?? tempF
        const iconEmoji = (() => {
          const t = tempC
          if (t == null) return '🌤️'
          if (t > 30) return '🥵'
          if (t > 22) return '☀️'
          if (t < 0) return '❄️'
          if (t < 12) return '🧥'
          return '🌤️'
        })()

        const weatherObj = {
          tempF,
          feelsLikeF,
          summary: conditionText || 'Weather',
          detail,
          iconEmoji
        }
        setWeather(weatherObj)
        // Persist weather snapshot
        try {
          localStorage.setItem(LS_KEYS.weather, JSON.stringify(weatherObj))
        } catch {}

        setRecommendations(flat)
        // Persist recommendation ids for rehydration
        try {
          localStorage.setItem(LS_KEYS.recs, JSON.stringify(flat.map(i => i.id)))
        } catch {}
        setHasSubmitted(true)
      } catch (err) {
        console.error('Weather fetch error', err)
        // Diagnostic: log setter before using it in error path
        console.log('DEBUG in catch: no setApiLog available; error=', err && err.message)
        console.log('Error:', err && err.message)
        setFetchError(err.message || 'Failed to fetch weather')
      } finally {
        setLoadingWeather(false);
      }
    })()
  };

  const handleSaveItem = (item) => {
    const existing = JSON.parse(
      localStorage.getItem("wsw-saved-items") ?? "[]"
    );
    const updated = [...existing, item];
    localStorage.setItem("wsw-saved-items", JSON.stringify(updated));
    setSavedCount(updated.length);

    // Remove item from recommendations so it doesn't show on landing page
    setRecommendations(prev => prev.filter(i => i.id !== item.id))

    // show "added to cart" message
    setAddedMessage(`You have added ${item.name} to cart!`);
    setTimeout(() => {
      setAddedMessage(null);
    }, 3000);
  };

  const defaultItems = clothingData && clothingData.length ? clothingData.slice(0, 6) : []
  
  const visibleItems = filterCategory === "All" 
    ? recommendations 
    : recommendations.filter(item => item.category === filterCategory)

  return (
    <div>
      {/* Full-width weather banner at the top */}
      <WeatherHero
        {...{
          hasSubmitted,
          location,
          date,
          weather
        }}
      />

      {/* Search form */}
      <Form onSubmit={handleSubmit} className="mb-3">
        <Row className="g-2 align-items-end">
          <Col xs={6} md={5} className="d-flex flex-column justify-content-end">
            <Form.Label htmlFor="location">Location</Form.Label>
            <LocationSearch
              value={location}
              onChange={(val) => setLocation(val)}
            />
          </Col>
          <Col xs={6} md={4} className="d-flex flex-column justify-content-end">
            <Form.Label htmlFor="date">Date</Form.Label>
            <Form.Control
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={minDate}
              max={maxDate}
            />
          </Col>
          <Col xs={12} md={3}>
            <Button type="submit" className="w-100">
              {loadingWeather ? 'Loading…' : 'Get Recommendations'}
            </Button>
          </Col>
        </Row>
        <div className="form-text mt-2">Choose a date between {minDate} and {maxDate}.</div>
      </Form>

      {/* fetch status and debug */}
      {fetchError && <Alert variant="danger">{fetchError}</Alert>}

      {/* small auto-dismiss success message when adding to basket */}
      {addedMessage && (
        <Alert variant="success" className="py-2">
          {addedMessage}
        </Alert>
      )}

      {!hasSubmitted && (
        <Alert variant="secondary" className="mt-2">
          Submit a location and date to see weather and outfit recommendations.
        </Alert>
      )}

      {hasSubmitted && (
        <>
          {/* Filter + basket count */}
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
            <Col
              xs={12}
              md={6}
              className="text-md-end mt-3 mt-md-0 fw-semibold"
            >
              Saved items in basket: {savedCount}
            </Col>
          </Row>

          {/* Clothing recommendations list */}
          <Row className="mt-3 g-3">
            {visibleItems.map((item) => (
              <Col key={item.id} xs={12} md={6} lg={4}>
                <ClothingCard
                  {...{
                    item,
                    onSave: handleSaveItem
                  }}
                />
              </Col>
            ))}
          </Row>
        </>
      )}
    </div>
  );
}
