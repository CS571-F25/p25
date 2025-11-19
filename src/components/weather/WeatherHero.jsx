// src/components/weather/WeatherHero.jsx

import { Row, Col } from "react-bootstrap";

export default function WeatherHero(props) {
  const titleLocation = props.location || "Your Location";
  const titleDate = props.date || "Select a date";

  return (
    <div
      className="mb-4 rounded-3 text-white"
      style={{
        background: "linear-gradient(90deg, #0d6efd, #6610f2)",
        padding: "2.5rem 1.5rem",
      }}
    >
      {!props.hasSubmitted ? (
        <div className="text-center">
          <h1 className="mb-2">Weather Smart Wardrobe</h1>
          <p className="mb-0">
            Enter a location and date within the next week to see forecasted
            weather and outfit recommendations, which you can then add to basket
            and purchase.
          </p>
        </div>
      ) : (
        <Row className="align-items-center">
          <Col xs={12} md={8}>
            <h1 className="mb-2">
              {titleLocation} on {titleDate}
            </h1>
            <p className="mb-0">
              <span style={{ fontSize: "2rem", marginRight: "0.5rem" }}>
                {props.weather.icon}
              </span>
              {props.weather.summary} • {Math.round(props.weather.temp)}°F
              {" (feels like "}
              {Math.round(props.weather.feelsLike)}°F) •{" "}
              {props.weather.detail}
            </p>
          </Col>
        </Row>
      )}
    </div>
  );
}
