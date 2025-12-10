import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";

import WeatherHero from "../weather/WeatherHero";
import RecommendationsList from "../wardrobe/RecommendationsList";
import clothingData from "../../data/clothing.json";

const LS_KEYS = {
  location: "wsw-location",
  date: "wsw-date",
  filter: "wsw-filter-category",
  submitted: "wsw-has-submitted",
  weather: "wsw-weather-snapshot",
  recs: "wsw-recommendation-ids"
};

export default function RecommendationsPage() {
  const navigate = useNavigate();

  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [savedCount, setSavedCount] = useState(
    JSON.parse(localStorage.getItem("wsw-saved-items") ?? "[]").length
  );
  const [filterCategory, setFilterCategory] = useState("All");
  const [weather, setWeather] = useState(null);
  const [addedMessage, setAddedMessage] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Initialize from sessionStorage on mount
  useEffect(() => {
    const hasSubmitted =
      typeof window !== "undefined" &&
      window.sessionStorage?.getItem(LS_KEYS.submitted) === "true";

    if (!hasSubmitted) {
      navigate("/");
      return;
    }

    setLocation(window.sessionStorage.getItem(LS_KEYS.location) ?? "");
    setDate(window.sessionStorage.getItem(LS_KEYS.date) ?? "");

    const storedFilter = window.sessionStorage.getItem(LS_KEYS.filter);
    if (storedFilter) {
      setFilterCategory(storedFilter);
    }

    const storedWeather = window.sessionStorage.getItem(LS_KEYS.weather);
    if (storedWeather) {
      try {
        setWeather(JSON.parse(storedWeather));
      } catch {
        // ignore
      }
    }

    const storedRecs = window.sessionStorage.getItem(LS_KEYS.recs);
    if (storedRecs) {
      try {
        const ids = JSON.parse(storedRecs);
        if (Array.isArray(ids) && ids.length) {
          const items = clothingData.filter((i) => ids.includes(i.id));
          setRecommendations(items);
        }
      } catch {
        // ignore
      }
    }

    setHasLoaded(true);
  }, [navigate]);

  // Persist filter to sessionStorage when it changes
  useEffect(() => {
    try {
      if (filterCategory != null) {
        window.sessionStorage.setItem(LS_KEYS.filter, filterCategory);
      }
    } catch {
      // ignore
    }
  }, [filterCategory]);

  const handleSaveItem = (item) => {
    // 1) Update basket in localStorage
    const existing = JSON.parse(
      localStorage.getItem("wsw-saved-items") ?? "[]"
    );
    const updatedBasket = [...existing, item];
    localStorage.setItem("wsw-saved-items", JSON.stringify(updatedBasket));
    setSavedCount(updatedBasket.length);

    // 2) Remove from recommendations + update sessionStorage rec IDs
    setRecommendations((prev) => {
      const next = prev.filter((i) => i.id !== item.id);
      try {
        const ids = next.map((i) => i.id);
        window.sessionStorage.setItem(LS_KEYS.recs, JSON.stringify(ids));
      } catch {
        // ignore
      }
      return next;
    });

    // 3) Small success message
    setAddedMessage(`You have added ${item.name} to cart!`);
    setTimeout(() => setAddedMessage(null), 3000);
  };

  if (!hasLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <WeatherHero
        hasSubmitted={true}
        location={location}
        date={date}
        weather={weather}
      />

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
            <option value="Accessory">Accessory</option>
          </Form.Select>
        </Col>
        <Col
          xs={12}
          md={6}
          className="d-flex flex-column justify-content-end gap-2"
        >
          <div className="text-md-end fw-semibold">
            Saved items in basket: {savedCount}
          </div>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => navigate("/")}
            className="align-self-md-end"
          >
            ← Back to Search
          </Button>
        </Col>
      </Row>

      {addedMessage && (
        <Alert variant="success" className="py-2">
          {addedMessage}
        </Alert>
      )}

      <RecommendationsList
        items={recommendations}
        filterCategory={filterCategory}
        onSave={handleSaveItem}
      />
    </div>
  );
}
