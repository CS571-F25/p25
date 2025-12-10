import { Row, Col, Alert } from "react-bootstrap";
import ClothingCard from "./ClothingCard";

export default function RecommendationsList({ items, filterCategory, onSave }) {
  const visibleItems =
    filterCategory === "All"
      ? items
      : items.filter((item) => item.category === filterCategory);

  if (!visibleItems.length) {
    return (
      <Row className="mt-3 g-3">
        <Col xs={12}>
          <Alert variant="info">
            No recommendations available. Please go back and try a different
            location or date.
          </Alert>
        </Col>
      </Row>
    );
  }

  return (
    <Row className="mt-3 g-3">
      {visibleItems.map((item) => (
        <Col key={item.id} xs={12} md={6} lg={4}>
          <ClothingCard item={item} onSave={onSave} />
        </Col>
      ))}
    </Row>
  );
}
