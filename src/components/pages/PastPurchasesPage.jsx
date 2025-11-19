// src/components/pages/PastPurchasesPage.jsx

import { useEffect, useState } from "react";
import { Alert, Col, Row } from "react-bootstrap";
import ClothingCard from "../cards/ClothingCard";

export default function PastPurchasesPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem("wsw-purchased-items") ?? "[]"
    );
    setItems(stored);
  }, []);

  return (
    <div>
      <h1 className="mb-3">Past Purchases</h1>

      {items.length === 0 ? (
        <Alert variant="secondary">
          You haven&apos;t marked any items as purchased yet.
        </Alert>
      ) : (
        <Row className="g-3">
          {items.map((item, idx) => (
            <Col key={`${item.id}-${idx}`} xs={12} md={6} lg={4}>
              {/* No save/remove/purchase here; just show the card */}
              <ClothingCard item={item} hideSave />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
