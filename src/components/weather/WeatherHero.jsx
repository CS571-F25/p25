import { Row, Col } from "react-bootstrap";

export default function WeatherHero(props) {
  const titleLocation = props.location || "Your location";
  const titleDate = props.date || "Select a date";
  const w = props.weather;

  return (
    <section
      className="mb-4 rounded-3 text-white"
      style={{
        background: "linear-gradient(90deg, #0d6efd, #6610f2)",
        padding: "2.5rem 1.5rem"
      }}
      aria-label="Weather summary"
    >
      {!props.hasSubmitted ? (
        <div className="text-center">
          <h1 className="mb-2">Weather Smart Wardrobe</h1>
          <p className="mb-0">
            Enter a location and date within the next week to see forecasted
            weather and outfit recommendations, which you can then add to your
            basket and purchase.
          </p>
        </div>
      ) : (
        <Row className="align-items-center">
          <Col xs={12} md={8}>
            <h1 className="mb-2">
              {titleLocation} on {titleDate}
            </h1>
            <p className="mb-0">
              {w.iconUrl ? (
                <img
                  src={w.iconUrl}
                  alt={w.summary}
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    marginRight: "0.5rem",
                    verticalAlign: "middle"
                  }}
                />
              ) : (
                <span
                  aria-hidden="true"
                  style={{ fontSize: "2rem", marginRight: "0.5rem" }}
                >
                  {w.iconEmoji}
                </span>
              )}
              {w.summary} • {Math.round(w.tempF)}°F{" "}
              <span>(feels like {Math.round(w.feelsLikeF)}°F)</span> •{" "}
              {w.detail}
            </p>
          </Col>
        </Row>
      )}
    </section>
  );
}
