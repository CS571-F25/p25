import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";

import LocationSearch from "../LocationSearch";
import WeatherHero from "../weather/WeatherHero";
import clothingData from "../../data/clothing.json";

const LS_KEYS = {
  location: "wsw-location",
  date: "wsw-date",
  filter: "wsw-filter-category",
  submitted: "wsw-has-submitted",
  weather: "wsw-weather-snapshot",
  recs: "wsw-recommendation-ids"
};

function clearSearchSession() {
  if (typeof window === "undefined") return;
  try {
    Object.values(LS_KEYS).forEach((key) =>
      window.sessionStorage.removeItem(key)
    );
  } catch {
    // ignore
  }
}

function getSessionItem(key, fallback = "") {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.sessionStorage.getItem(key);
    return v === null ? fallback : v;
  } catch {
    return fallback;
  }
}

function setSessionItem(key, value) {
  if (typeof window === "undefined") return;
  try {
    if (value === null || value === undefined || value === "") {
      window.sessionStorage.removeItem(key);
    } else {
      window.sessionStorage.setItem(key, value);
    }
  } catch {
    // ignore
  }
}

function formatLocalDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const today = new Date();
const minDate = formatLocalDate(today);
const maxDateObj = new Date(today);
maxDateObj.setDate(today.getDate() + 7);
const maxDate = formatLocalDate(maxDateObj);

export default function SearchPage() {
  const navigate = useNavigate();

  const [location, setLocation] = useState(() =>
    getSessionItem(LS_KEYS.location, "")
  );
  const [date, setDate] = useState(() => getSessionItem(LS_KEYS.date, ""));
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [fetchError, setFetchError] = useState("");

  // Clear session when returning to search page
  useEffect(() => {
    clearSearchSession();
  }, []);

  // Persist location/date within the session
  useEffect(() => {
    setSessionItem(LS_KEYS.location, location);
  }, [location]);

  useEffect(() => {
    setSessionItem(LS_KEYS.date, date);
  }, [date]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!location || !date) {
      setFetchError("Please choose a location from the search suggestions and a date.");
      return;
    }

    setFetchError("");
    setLoadingWeather(true);

    (async () => {
      try {
        const key = import.meta.env.VITE_WEATHERAPI_KEY;
        if (!key) {
          setFetchError(
            "Weather API key missing. Add VITE_WEATHERAPI_KEY to your .env."
          );
          setLoadingWeather(false);
          return;
        }

        const url = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${encodeURIComponent(
          location
        )}&days=1&aqi=no&alerts=no`;

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Weather API error ${res.status}`);
        }

        const data = await res.json();

        let tempC = null;
        let conditionText = "";

        if (data.forecast?.forecastday?.length) {
          const forecastDay = data.forecast.forecastday[0];
          const dayCondition = forecastDay.day;
          tempC =
            typeof dayCondition.avgtemp_c === "number"
              ? dayCondition.avgtemp_c
              : typeof data.current?.temp_c === "number"
              ? data.current.temp_c
              : null;
          conditionText =
            dayCondition.condition?.text ??
            data.current?.condition?.text ??
            "";
        }

        const recs = [];
        const t = tempC ?? 20;

        if (/rain|shower|drizzle/i.test(conditionText)) {
          recs.push(
            ...clothingData.filter(
              (i) => i.weatherTag && /rainy/i.test(i.weatherTag)
            )
          );
        }

        if (t < 0) {
          recs.push(
            ...clothingData.filter(
              (i) => i.weatherTag && /very cold/i.test(i.weatherTag)
            )
          );
        } else if (t < 12) {
          recs.push(
            ...clothingData.filter(
              (i) =>
                i.weatherTag && /cold|very cold/i.test(i.weatherTag.toLowerCase())
            )
          );
        } else if (t < 20) {
          recs.push(
            ...clothingData.filter(
              (i) =>
                i.weatherTag &&
                /cool|mild/i.test(i.weatherTag.toLowerCase())
            )
          );
        } else if (t < 25) {
          recs.push(
            ...clothingData.filter(
              (i) =>
                i.weatherTag &&
                /warm|sunny/i.test(i.weatherTag.toLowerCase())
            )
          );
        } else {
          recs.push(
            ...clothingData.filter(
              (i) =>
                i.weatherTag &&
                /hot|warm|sunny/i.test(i.weatherTag.toLowerCase())
            )
          );
        }

        recs.push(
          ...clothingData.filter(
            (i) =>
              i.weatherTag &&
              /all-purpose/i.test(i.weatherTag.toLowerCase())
          )
        );

        const flat = recs
          .filter(Boolean)
          .filter((v, i, a) => a.indexOf(v) === i);

        const detail = (() => {
          const current = data.current ?? null;
          const humidity =
            typeof current?.humidity === "number"
              ? `${current.humidity}% humidity`
              : null;
          const wind =
            typeof current?.wind_kph === "number"
              ? `${current.wind_kph} kph wind`
              : null;
          const rainChance =
            typeof data?.forecast?.forecastday?.[0]?.day
              ?.daily_chance_of_rain === "number"
              ? `${data.forecast.forecastday[0].day.daily_chance_of_rain}% chance of rain`
              : null;
          return [humidity, wind, rainChance].filter(Boolean).join(" · ");
        })();

        const tempF =
          tempC != null
            ? tempC * (9 / 5) + 32
            : data.current?.temp_f ?? null;
        const feelsLikeF = data.current?.feelslike_f ?? tempF;

        const iconEmoji = (() => {
          if (tempC == null) return "🌤️";
          if (tempC > 30) return "🥵";
          if (tempC > 22) return "☀️";
          if (tempC < 0) return "❄️";
          if (tempC < 12) return "🧥";
          return "🌤️";
        })();

        const weatherObj = {
          tempF,
          feelsLikeF,
          summary: conditionText || "Weather",
          detail,
          iconEmoji
        };

        try {
          window.sessionStorage.setItem(
            LS_KEYS.weather,
            JSON.stringify(weatherObj)
          );
          window.sessionStorage.setItem(
            LS_KEYS.recs,
            JSON.stringify(flat.map((i) => i.id))
          );
          window.sessionStorage.setItem(LS_KEYS.submitted, "true");
        } catch {
          // ignore
        }

        navigate("/recommendations");
      } catch (err) {
        console.error("Weather fetch error", err);
        setFetchError(err.message || "Failed to fetch weather.");
      } finally {
        setLoadingWeather(false);
      }
    })();
  };

  const handleClear = () => {
    setLocation("");
    setDate("");
    setFetchError("");
    clearSearchSession();
  };

  return (
    <div>
      <WeatherHero hasSubmitted={false} />

      <section aria-label="Weather search">
        <Form onSubmit={handleSubmit} className="mb-3">
          <Row className="g-2 align-items-end">
            <Col
              xs={12}
              md={5}
              className="d-flex flex-column justify-content-end"
            >
              <Form.Label htmlFor="location">Location</Form.Label>
              <LocationSearch
                value={location}
                onChange={(val) => setLocation(val)}
              />
            </Col>
            <Col
              xs={12}
              md={4}
              className="d-flex flex-column justify-content-end"
            >
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
              <div className="d-flex gap-2">
                <Button type="submit" className="w-100">
                  {loadingWeather ? "Loading…" : "Get Recommendations"}
                </Button>
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={handleClear}
                  aria-label="Clear weather search"
                >
                  Clear
                </Button>
              </div>
            </Col>
          </Row>
          <div className="form-text mt-2">
            Choose a date between {minDate} and {maxDate}.
          </div>
        </Form>

        {fetchError && <Alert variant="danger">{fetchError}</Alert>}

        {!fetchError && (
          <Alert variant="secondary" className="mt-2">
            Submit a location and date to see weather and outfit
            recommendations.
          </Alert>
        )}
      </section>
    </div>
  );
}
