// src/components/pages/SearchPage.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Alert,
  Button,
  Col,
  Form,
  Row
} from "react-bootstrap";
import LocationSearch from '../LocationSearch'
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


export default function SearchPage() {
  const navigate = useNavigate()
  
  const LS_KEYS = {
    location: 'wsw-location',
    date: 'wsw-date',
    submitted: 'wsw-has-submitted',
    weather: 'wsw-weather-snapshot',
    recs: 'wsw-recommendation-ids'
  }
  
  const [location, setLocation] = useState(localStorage.getItem(LS_KEYS.location) ?? "");
  const [date, setDate] = useState(localStorage.getItem(LS_KEYS.date) ?? "");
  const [loadingWeather, setLoadingWeather] = useState(false)
  const [fetchError, setFetchError] = useState('')

  // Persist location and date to localStorage when they change
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!location || !date) return;

    setFetchError('')
    setLoadingWeather(true);

    (async () => {
      try {
        // request forecast for 1 day and use the day matching the selected date (or today)
        const key = import.meta.env.VITE_WEATHERAPI_KEY
        if (!key) {
          setFetchError('Weather API key missing. Add VITE_WEATHERAPI_KEY to .env')
          setLoadingWeather(false)
          return
        }

        const url = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${encodeURIComponent(location)}&days=1&aqi=no&alerts=no`
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Weather API error ${res.status}`)
        
        const data = await res.json()
        console.log('Weather API response', data)
        
        // Extract weather data from API response
        let tempC = null
        let conditionText = ''
        
        if (data.forecast && data.forecast.forecastday && data.forecast.forecastday.length > 0) {
          const forecastDay = data.forecast.forecastday[0]
          const dayCondition = forecastDay.day
          tempC = (typeof dayCondition.avgtemp_c === 'number')
            ? dayCondition.avgtemp_c
            : (data.current && typeof data.current.temp_c === 'number' ? data.current.temp_c : null)
          conditionText = dayCondition.condition && dayCondition.condition.text ? dayCondition.condition.text : (data.current && data.current.condition && data.current.condition.text ? data.current.condition.text : '')
          const chanceOfRain = typeof dayCondition.daily_chance_of_rain === 'number' ? dayCondition.daily_chance_of_rain : 0
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
          recs.push(...clothingData.filter(i => 
            i.weatherTag && /very cold/i.test(i.weatherTag)
          ))
        } else if (t < 12) {
          recs.push(...clothingData.filter(i => 
            i.weatherTag && /cold|very cold/i.test(i.weatherTag)
          ))
        } else if (t < 20) {
          recs.push(...clothingData.filter(i => 
            i.weatherTag && /cool|mild/i.test(i.weatherTag)
          ))
        } else if (t < 25) {
          recs.push(...clothingData.filter(i => 
            i.weatherTag && /warm|sunny/i.test(i.weatherTag)
          ))
        } else {
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
          const rainChance = typeof (data?.forecast?.forecastday?.[0]?.day?.daily_chance_of_rain) === 'number' ? `${data.forecast.forecastday[0].day.daily_chance_of_rain}% chance of rain` : null
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
        
        // Persist weather snapshot
        try {
          localStorage.setItem(LS_KEYS.weather, JSON.stringify(weatherObj))
        } catch {}

        // Persist recommendation ids for rehydration
        try {
          localStorage.setItem(LS_KEYS.recs, JSON.stringify(flat.map(i => i.id)))
        } catch {}
        
        // Mark as submitted and navigate to recommendations page
        localStorage.setItem(LS_KEYS.submitted, 'true')
        navigate('/recommendations')
      } catch (err) {
        console.error('Weather fetch error', err)
        setFetchError(err.message || 'Failed to fetch weather')
      } finally {
        setLoadingWeather(false);
      }
    })()
  };

  return (
    <div>
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

      {/* fetch status */}
      {fetchError && <Alert variant="danger">{fetchError}</Alert>}

      <Alert variant="secondary" className="mt-2">
        Submit a location and date to see weather and outfit recommendations.
      </Alert>
    </div>
  );
}
