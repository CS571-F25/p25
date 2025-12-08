import { useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import CitySelector from "../forms/CitySelector";
import WeatherHero from "../weather/WeatherHero";
import RecommendationsList from "../recommendations/RecommendationsList";

// default weather for first render (before any search)
const DEFAULT_WEATHER = {
  tempF: 68,
  feelsLikeF: 67,
  summary: "Partly cloudy",
  detail: "Light breeze, low chance of rain",
  iconEmoji: "🌤️",
  iconUrl: null
};

// base catalog of clothing options
const OUTFIT_SETS = {
  cold: [
    {
      name: "Insulated winter coat",
      category: "Outerwear",
      weatherTag: "Very cold",
      description: "Heavy insulated coat to keep you warm below freezing."
    },
    {
      name: "Snow pants",
      category: "Bottom",
      weatherTag: "Snow & ice",
      description: "Waterproof snow pants for slush and deep snow."
    },
    {
      name: "Thermal base layer",
      category: "Bottom",
      weatherTag: "Very cold",
      description: "Thermal leggings to wear under pants."
    },
    {
      name: "Beanie",
      category: "Accessories",
      weatherTag: "Cold",
      description: "Knit hat to keep your ears warm."
    },
    {
      name: "Insulated gloves",
      category: "Accessories",
      weatherTag: "Cold",
      description: "Water-resistant gloves for wind and snow."
    },
    {
      name: "Insulated boots",
      category: "Footwear",
      weatherTag: "Snow & ice",
      description: "Warm, waterproof boots with good traction."
    }
  ],
  cool: [
    {
      name: "Light jacket",
      category: "Outerwear",
      weatherTag: "Cool & breezy",
      description: "Perfect for 40–55°F days."
    },
    {
      name: "Sweater",
      category: "Top",
      weatherTag: "Cool",
      description: "Layer over a tee for extra warmth."
    },
    {
      name: "Jeans",
      category: "Bottom",
      weatherTag: "All-purpose",
      description: "Versatile choice for most cool or mild days."
    }
  ],
  mild: [
    {
      name: "Long-sleeve t-shirt",
      category: "Top",
      weatherTag: "Mild",
      description: "Comfortable for 55–70°F weather."
    },
    {
      name: "Chinos",
      category: "Bottom",
      weatherTag: "Mild",
      description: "Lightweight pants for comfortable, dry days."
    },
    {
      name: "Light sneakers",
      category: "Footwear",
      weatherTag: "Dry",
      description: "Everyday shoes for walking around campus."
    },
    {
      name: "Light hoodie",
      category: "Outerwear",
      weatherTag: "Evening",
      description: "Easy extra layer for cooler evenings."
    }
  ],
  hot: [
    {
      name: "T-shirt",
      category: "Top",
      weatherTag: "Warm & sunny",
      description: "Breathable t-shirt for hot days."
    },
    {
      name: "Tank top",
      category: "Top",
      weatherTag: "Very hot",
      description: "Keeps you cool in strong heat."
    },
    {
      name: "Shorts",
      category: "Bottom",
      weatherTag: "Hot",
      description: "Ideal for temperatures above 75°F."
    },
    {
      name: "Sandals",
      category: "Footwear",
      weatherTag: "Dry & hot",
      description: "Open shoes for dry, hot weather."
    },
    {
      name: "Sun hat",
      category: "Accessories",
      weatherTag: "Sunny",
      description: "Helps shade your face from the sun."
    }
  ],
  rainy: [
    {
      name: "Waterproof raincoat",
      category: "Outerwear",
      weatherTag: "Rain",
      description: "Keeps you dry during light or steady rain."
    },
    {
      name: "Compact umbrella",
      category: "Accessories",
      weatherTag: "Rain",
      description: "Easy to toss in a backpack for surprise showers."
    },
    {
      name: "Waterproof boots",
      category: "Footwear",
      weatherTag: "Rain & puddles",
      description: "Keeps your socks dry when streets are wet."
    }
  ],
  snowy: [
    {
      name: "Down parka",
      category: "Outerwear",
      weatherTag: "Snow",
      description: "Thick parka for snowy, windy days."
    },
    {
      name: "Snow boots",
      category: "Footwear",
      weatherTag: "Snow",
      description: "Grippy boots to prevent slipping on ice."
    },
    {
      name: "Scarf",
      category: "Accessories",
      weatherTag: "Snow & wind",
      description: "Keeps your neck and face warm in the wind."
    }
  ]
};

function buildRecommendations(tempF, conditionText) {
  const text = (conditionText || "").toLowerCase();
  let items = [];

  if (/rain|drizzle|shower|storm/i.test(text)) {
    items = items.concat(OUTFIT_SETS.rainy);
  }
  if (/snow|sleet|blizzard|ice/i.test(text)) {
    items = items.concat(OUTFIT_SETS.snowy);
  }

  if (tempF <= 32) {
    items = items.concat(OUTFIT_SETS.cold);
  } else if (tempF <= 50) {
    items = items.concat(OUTFIT_SETS.cool);
  } else if (tempF <= 75) {
    items = items.concat(OUTFIT_SETS.mild);
  } else {
    items = items.concat(OUTFIT_SETS.hot);
  }

  if (!items.length) {
    items = OUTFIT_SETS.mild;
  }

  const seen = new Set();
  const unique = [];
  items.forEach((it) => {
    if (!seen.has(it.name)) {
      seen.add(it.name);
      unique.push(it);
    }
  });

  return unique.map((it, idx) => ({
    ...it,
    id: idx + 1
  }));
}

export default function LandingPage() {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [savedCount, setSavedCount] = useState(
    JSON.parse(localStorage.getItem("wsw-saved-items") ?? "[]").length
  );
  const [filterCategory, setFilterCategory] = useState("All");
  const [weather, setWeather] = useState(DEFAULT_WEATHER);
  const [addedMessage, setAddedMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recommendations, setRecommendations] = useState(
    buildRecommendations(DEFAULT_WEATHER.tempF, DEFAULT_WEATHER.summary)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!location) {
      setError(
        "Please choose a city (you can start typing and pick a suggestion)."
      );
      return;
    }
    if (!date) {
      setError("Please select a date for the forecast.");
      return;
    }

    const apiKey =
      import.meta.env.VITE_WEATHERAPI_KEY ||
      "be696810a79144c9901124327251911";

    if (!apiKey) {
      setError("Weather API key is missing.");
      return;
    }

    setLoading(true);
    try {
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(
        location
      )}&days=7&aqi=no&alerts=no`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Weather request failed (${res.status})`);
      }
      const data = await res.json();

      const forecastDays = data.forecast?.forecastday ?? [];
      let selectedDay =
        forecastDays.find((d) => d.date === date) || forecastDays[0] || null;

      let tempF;
      let feelsLikeF;
      let summary;
      let detail;
      let iconUrl = null;

      if (selectedDay) {
        const day = selectedDay.day;
        tempF = day.avgtemp_f;
        feelsLikeF = day.avgtemp_f;
        summary = day.condition?.text ?? "Forecast";
        detail = `High ${Math.round(
          day.maxtemp_f
        )}°F / Low ${Math.round(day.mintemp_f)}°F · humidity ${
          day.avghumidity
        }%`;
        if (day.condition?.icon) {
          iconUrl = `https:${day.condition.icon}`;
        }
      } else if (data.current) {
        const c = data.current;
        tempF = c.temp_f;
        feelsLikeF = c.feelslike_f;
        summary = c.condition?.text ?? "Current weather";
        detail = `Wind ${Math.round(
          c.wind_mph
        )} mph · humidity ${c.humidity}%`;
        if (c.condition?.icon) {
          iconUrl = `https:${c.condition.icon}`;
        }
      } else {
        throw new Error("Weather data is not available for that date.");
      }

      const normalizedWeather = {
        tempF,
        feelsLikeF,
        summary,
        detail,
        iconEmoji: "🌤️",
        iconUrl
      };

      setWeather(normalizedWeather);
      setRecommendations(buildRecommendations(tempF, summary));
      setHasSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to fetch weather data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = (item) => {
    const existing = JSON.parse(
      localStorage.getItem("wsw-saved-items") ?? "[]"
    );
    const updated = [...existing, item];
    localStorage.setItem("wsw-saved-items", JSON.stringify(updated));
    setSavedCount(updated.length);

    setAddedMessage(`You have added ${item.name} to cart!`);
    window.setTimeout(() => {
      setAddedMessage(null);
    }, 3000);
  };

  return (
    <div>
      <WeatherHero
        {...{
          hasSubmitted,
          location,
          date,
          weather
        }}
      />

      <Form
        onSubmit={handleSubmit}
        className="mb-3"
        aria-label="Weather search form"
      >
        <Row className="g-2 align-items-end">
          <Col xs={12} md={5}>
            <CitySelector
              id="location"
              label="Location"
              value={location}
              onChange={setLocation}
            />
          </Col>
          <Col xs={12} md={4}>
            <Form.Label htmlFor="date">Date</Form.Label>
            <Form.Control
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Col>
          <Col xs={12} md={3}>
            <Button type="submit" className="w-100" disabled={loading}>
              {loading ? "Loading forecast…" : "Get Recommendations"}
            </Button>
          </Col>
        </Row>
      </Form>

      {error && (
        <Alert variant="danger" role="alert">
          {error}
        </Alert>
      )}

      {addedMessage && (
        <Alert variant="success" className="py-2" role="status">
          {addedMessage}
        </Alert>
      )}

      {!hasSubmitted && !error && (
        <Alert variant="secondary" className="mt-2" role="status">
          Submit a location and date to see weather and outfit recommendations.
        </Alert>
      )}

      {hasSubmitted && (
        <>
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
                <option value="Footwear">Footwear</option>
                <option value="Accessories">Accessories</option>
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

          <RecommendationsList
            items={recommendations}
            filterCategory={filterCategory}
            onSave={handleSaveItem}
          />
        </>
      )}
    </div>
  );
}
