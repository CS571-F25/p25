import { Row, Col, Form } from "react-bootstrap";
import RecommendationsList from "./RecommendationsList";

export default function RecommendationsPanel(props) {
  if (!props.hasSubmitted) return null;

  return (
    <section aria-label="Outfit recommendations">
      <Row className="mb-3 mt-2">
        <Col xs={12} md={6}>
          <Form.Label htmlFor="category">Filter by category</Form.Label>
          <Form.Select
            id="category"
            value={props.filterCategory}
            onChange={(e) => props.onFilterChange(e.target.value)}
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
          Saved items in basket: {props.savedCount}
        </Col>
      </Row>

      <RecommendationsList
        {...{
          items: props.recommendations,
          filterCategory: props.filterCategory,
          onSave: props.onSaveItem
        }}
      />
    </section>
  );
}
