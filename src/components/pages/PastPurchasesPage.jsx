import { useEffect, useState } from "react";
import { Alert, Button, Col, Modal, Row } from "react-bootstrap";
import ClothingCard from "../wardrobe/ClothingCard";

export default function PastPurchasesPage() {
  const [items, setItems] = useState([]); // [{ item, quantity }]
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem("wsw-purchased-items") ?? "[]"
    );

    // Aggregate by item.id into { item, quantity }
    const byId = new Map();
    stored.forEach((item) => {
      const key = item.id || item.name;
      if (!byId.has(key)) {
        byId.set(key, { item, quantity: 1 });
      } else {
        const existing = byId.get(key);
        existing.quantity += 1;
      }
    });

    setItems(Array.from(byId.values()));
  }, []);

  const handleOpenClear = () => setShowClearModal(true);
  const handleCancelClear = () => setShowClearModal(false);

  const handleConfirmClear = () => {
    localStorage.removeItem("wsw-purchased-items");
    setItems([]);
    setShowClearModal(false);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="mb-0">Past Purchases</h1>
        {items.length > 0 && (
          <Button
            variant="outline-danger"
            size="sm"
            onClick={handleOpenClear}
            aria-label="Clear past purchase history"
          >
            Clear history
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <Alert variant="secondary">
          You haven&apos;t marked any items as purchased yet.
        </Alert>
      ) : (
        <Row className="g-3">
          {items.map(({ item, quantity }, idx) => (
            <Col key={`${item.id}-${idx}`} xs={12} md={6} lg={4}>
              <ClothingCard
                item={item}
                hideSave
                quantity={quantity} // pass quantity into the card
              />
            </Col>
          ))}
        </Row>
      )}

      <Modal show={showClearModal} onHide={handleCancelClear} centered>
        <Modal.Header closeButton>
          <Modal.Title>Clear purchase history?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to clear your past purchases? This will erase
            your purchase history from this browser.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelClear}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmClear}>
            Clear history
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
