import { Row, Col, Alert } from "react-bootstrap";
import ClothingCard from "../cards/ClothingCard";

export default function RecommendationsList(props) {
  const filtered = props.items.filter(
    (item) =>
      props.filterCategory === "All" || item.category === props.filterCategory
  );

  if (!filtered.length) {
    return (
      <Alert variant="info" role="status" className="mt-3">
        No outfit recommendations match the selected filters.
      </Alert>
    );
  }

  return (
    <Row className="mt-3 g-3">
      {filtered.map((item) => (
        <Col key={item.id} xs={12} md={6} lg={4}>
          <ClothingCard {...{ item, onSave: props.onSave }} />
        </Col>
      ))}
    </Row>
  );
}
