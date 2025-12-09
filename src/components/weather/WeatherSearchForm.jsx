import { Form, Row, Col, Button, Alert } from "react-bootstrap";
import CitySelector from "./CitySelector";

export default function WeatherSearchForm(props) {
  return (
    <section aria-label="Weather search">
      <Form
        onSubmit={props.onSubmit}
        className="mb-3"
        aria-label="Weather search form"
      >
        <Row className="g-2 align-items-end">
          <Col xs={12} md={5}>
            <CitySelector
              {...{
                id: "location",
                label: "Location",
                value: props.location,
                onChange: props.onLocationChange
              }}
            />
          </Col>
          <Col xs={12} md={4}>
            <Form.Label htmlFor="date">Date</Form.Label>
            <Form.Control
              id="date"
              type="date"
              value={props.date}
              onChange={(e) => props.onDateChange(e.target.value)}
            />
          </Col>
          <Col xs={12} md={3}>
            <div className="d-flex gap-2">
              <Button
                type="submit"
                className="w-100"
                disabled={props.loading}
              >
                {props.loading ? "Loading forecast…" : "Get Recommendations"}
              </Button>
              <Button
                type="button"
                variant="outline-secondary"
                onClick={props.onClear}
                aria-label="Clear weather search and recommendations"
              >
                Clear
              </Button>
            </div>
          </Col>
        </Row>
      </Form>

      {props.error && (
        <Alert variant="danger" role="alert">
          {props.error}
        </Alert>
      )}

      {props.addedMessage && (
        <Alert variant="success" className="py-2" role="status">
          {props.addedMessage}
        </Alert>
      )}

      {!props.hasSubmitted && !props.error && (
        <Alert variant="secondary" className="mt-2" role="status">
          Submit a location and date to see weather and outfit recommendations.
        </Alert>
      )}
    </section>
  );
}
