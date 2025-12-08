import { useState, useEffect } from "react";
import WeatherHero from "../weather/WeatherHero";
import WeatherSearchForm from "../weather/WeatherSearchForm";
import RecommendationsPanel from "../wardrobe/RecommendationsPanel";

const LANDING_STATE_KEY = "wsw-landing-state";
let hasCheckedNavigationType = false;

// default weather for first render (before any search)
const DEFAULT_WEATHER = {
  tempF: 68,
  feelsLikeF: 67,
  summary: "Partly cloudy",
  detail: "Light breeze, low chance of rain",
  iconEmoji: "🌤️",
  iconUrl: null
};

// base catalog of clothing options, with consistent weather tags
const OUTFIT_SETS = {
  cold: [
    { name: "Insulated winter coat", category: "Outerwear",   weatherTag: "Freezing" },
    { name: "Snow pants",            category: "Bottom",      weatherTag: "Freezing" },
    { name: "Thermal base layer",    category: "Bottom",      weatherTag: "Freezing" },
    { name: "Beanie",                category: "Accessories", weatherTag: "Freezing" },
    { name: "Insulated gloves",      category: "Accessories", weatherTag: "Freezing" },
    { name: "Insulated boots",       category: "Footwear",    weatherTag: "Freezing" }
  ],
  cool: [
    { name: "Light jacket",  category: "Outerwear", weatherTag: "Cool" },
    { name: "Sweater",       category: "Top",       weatherTag: "Cool" },
    { name: "Jeans",         category: "Bottom",    weatherTag: "Cool" }
  ],
  mild: [
    { name: "Long-sleeve t-shirt", category: "Top",       weatherTag: "Mild" },
    { name: "Chinos",              category: "Bottom",    weatherTag: "Mild" },
    { name: "Light sneakers",      category: "Footwear",  weatherTag: "Mild" },
    { name: "Light hoodie",        category: "Outerwear", weatherTag: "Mild" }
  ],
  hot: [
    { name: "T-shirt",   category: "Top",       weatherTag: "Hot" },
    { name: "Tank top",  category: "Top",       weatherTag: "Hot" },
    { name: "Shorts",    category: "Bottom",    weatherTag: "Hot" },
    { name: "Sandals",   category: "Footwear",  weatherTag: "Hot" },
    { name: "Sun hat",   category: "Accessories", weatherTag: "Hot" }
  ],
  rainy: [
    { name: "Waterproof raincoat", category: "Outerwear",   weatherTag: "Rainy" },
    { name: "Compact umbrella",    category: "Accessories", weatherTag: "Rainy" },
    { name: "Waterproof boots",    category: "Footwear",    weatherTag: "Rainy" }
  ],
  snowy: [
    { name: "Down parka", category: "Outerwear",   weatherTag: "Snowy" },
    { name: "Snow boots", category: "Footwear",    weatherTag: "Snowy" },
    { name: "Scarf",      category: "Accessories", weatherTag: "Snowy" }
  ]
};

function buildRecommendations(tempF, conditionText) {
  const text = (conditionText || "").toLowerCase();
  let items = [];

  // precip-based sets
  if (/rain|drizzle|shower|storm/i.test(text)) {
    items = items.concat(OUTFIT_SETS.rainy);
  }
  if (/snow|sleet|blizzard|ice/i.test(text)) {
    items = items.concat(OUTFIT_SETS.snowy);
  }

  // temperature-based sets
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

  // de-duplicate by name
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

function getInitialLandingState() {
  if (typeof window === "undefined") return null;

  try {
    // Only apply the "reload" rule once per actual page load.
    if (!hasCheckedNavigationType) {
      hasCheckedNavigationType = true;

      const navEntries =
        window.performance && window.performance.getEntriesByType
          ? window.performance.getEntriesByType("navigation")
          : null;
      const nav = navEntries && navEntries[0];

      // If this tab was opened via a full reload, start from a clean slate
      // for this load (do not reuse any previous sessionStorage state).
      if (nav && nav.type === "reload") {
        window.sessionStorage.removeItem(LANDING_STATE_KEY);
        return null;
      }
    }

    const raw = window.sessionStorage.getItem(LANDING_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}


export default function LandingPage() {
  const saved = getInitialLandingState() || {};

  const [location, setLocation] = useState(saved.location ?? "");
  const [date, setDate] = useState(saved.date ?? "");
  const [hasSubmitted, setHasSubmitted] = useState(
    saved.hasSubmitted && saved.weather && saved.recommendations?.length
      ? true
      : false
  );
  const [savedCount, setSavedCount] = useState(() => {
    if (typeof window === "undefined") return 0;
    try {
      return JSON.parse(
        window.localStorage.getItem("wsw-saved-items") ?? "[]"
      ).length;
    } catch {
      return 0;
    }
  });
  const [filterCategory, setFilterCategory] = useState(
    saved.filterCategory ?? "All"
  );
  const [weather, setWeather] = useState(saved.weather ?? DEFAULT_WEATHER);
  const [addedMessage, setAddedMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recommendations, setRecommendations] = useState(
    saved.recommendations ??
      buildRecommendations(DEFAULT_WEATHER.tempF, DEFAULT_WEATHER.summary)
  );

  // persist landing page state in sessionStorage so it survives navigation
  // between pages, but *not* full page reload (handled in getInitialLandingState)
  useEffect(() => {
    const snapshot = {
      location,
      date,
      hasSubmitted,
      weather,
      filterCategory,
      recommendations
    };
    try {
      window.sessionStorage.setItem(
        LANDING_STATE_KEY,
        JSON.stringify(snapshot)
      );
    } catch {
      // ignore storage errors
    }
  }, [location, date, hasSubmitted, weather, filterCategory, recommendations]);

  async function handleSubmit(e) {
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
      const selectedDay =
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
  }

  function handleClear() {
    setLocation("");
    setDate("");
    setHasSubmitted(false);
    setWeather(DEFAULT_WEATHER);
    setRecommendations(
      buildRecommendations(DEFAULT_WEATHER.tempF, DEFAULT_WEATHER.summary)
    );
    setFilterCategory("All");
    setError("");
    setAddedMessage(null);

    try {
      window.sessionStorage.removeItem(LANDING_STATE_KEY);
    } catch {
      // ignore storage errors
    }
  }

  function handleSaveItem(item) {
    const existing = JSON.parse(
      window.localStorage.getItem("wsw-saved-items") ?? "[]"
    );
    const updated = [...existing, item];
    window.localStorage.setItem("wsw-saved-items", JSON.stringify(updated));
    setSavedCount(updated.length);

    setAddedMessage(`You have added ${item.name} to cart!`);
    window.setTimeout(() => {
      setAddedMessage(null);
    }, 3000);
  }

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

      <WeatherSearchForm
        {...{
          location,
          date,
          loading,
          error,
          hasSubmitted,
          addedMessage,
          onLocationChange: setLocation,
          onDateChange: setDate,
          onSubmit: handleSubmit,
          onClear: handleClear
        }}
      />

      <RecommendationsPanel
        {...{
          hasSubmitted,
          filterCategory,
          savedCount,
          recommendations,
          onFilterChange: setFilterCategory,
          onSaveItem: handleSaveItem
        }}
      />
    </div>
  );
}
