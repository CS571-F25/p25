// src/components/pages/LandingPage.jsx

import { useState } from "react";
import {
  Alert,
  Button,
  Col,
  Form,
  Row
} from "react-bootstrap";
import ClothingCard from "../cards/ClothingCard";
import WeatherHero from "../weather/WeatherHero";

const SAMPLE_RECOMMENDATIONS = [
  {
    id: 1,
    name: "Light Jacket",
    category: "Outerwear",
    weatherTag: "Cool & Dry",
    description: "Great for breezy, cool days."
  },
  {
    id: 2,
    name: "Raincoat",
    category: "Outerwear",
    weatherTag: "Rainy",
    description: "Keeps you dry during showers."
  },
  {
    id: 3,
    name: "Sweater",
    category: "Top",
    weatherTag: "Cool",
    description: "Comfortable warmth for mild cold."
  },
  {
    id: 4,
    name: "T-Shirt",
    category: "Top",
    weatherTag: "Warm & Sunny",
    description: "Best for warm, sunny weather."
  },
  {
    id: 5,
    name: "Jeans",
    category: "Bottom",
    weatherTag: "All-purpose",
    description: "Versatile choice for most days."
  }
];

// temporary sample weather; later replace with real API data
const SAMPLE_WEATHER = {
  temp: 68,
  feelsLike: 67,
  summary: "Partly cloudy",
  detail: "Light breeze, low chance of rain",
  icon: "🌤️"
};

export default function LandingPage() {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [savedCount, setSavedCount] = useState(
    JSON.parse(localStorage.getItem("wsw-saved-items") ?? "[]").length
  );
  const [filterCategory, setFilterCategory] = useState("All");
  const [weather, setWeather] = useState(null); // will hold real API result later
  const [addedMessage, setAddedMessage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!location || !date) return;

    // TODO: replace this with a fetch call to OpenWeather
    setWeather(SAMPLE_WEATHER);
    setHasSubmitted(true);
  };

  const handleSaveItem = (item) => {
    const existing = JSON.parse(
      localStorage.getItem("wsw-saved-items") ?? "[]"
    );
    const updated = [...existing, item];
    localStorage.setItem("wsw-saved-items", JSON.stringify(updated));
    setSavedCount(updated.length);

    // show "added to cart" message
    setAddedMessage(`You have added ${item.name} to cart!`);
    setTimeout(() => {
      setAddedMessage(null);
    }, 3000);
  };

  const visibleItems = SAMPLE_RECOMMENDATIONS.filter(
    (item) => filterCategory === "All" || item.category === filterCategory
  );

  return (
    <div>
      {/* Full-width weather banner at the top */}
      <WeatherHero
        {...{
          hasSubmitted,
          location,
          date,
          weather: weather ?? SAMPLE_WEATHER
        }}
      />

      {/* Search form */}
      <Form onSubmit={handleSubmit} className="mb-3">
        <Row className="g-2 align-items-end">
          <Col xs={12} md={5}>
            <Form.Label htmlFor="location">Location</Form.Label>
            <Form.Control
              id="location"
              type="text"
              placeholder="e.g., Madison, US"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
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
            <Button type="submit" className="w-100">
              Get Recommendations
            </Button>
          </Col>
        </Row>
      </Form>

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
