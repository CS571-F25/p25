import { useEffect, useState } from "react";
import { Alert, Col, Row, Modal, Button } from "react-bootstrap";
import ClothingCard from "../wardrobe/ClothingCard";

export default function BasketPage() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem("wsw-saved-items") ?? "[]"
    );
    setItems(stored);
  }, []);

  const updateBasket = (newItems) => {
    setItems(newItems);
    localStorage.setItem("wsw-saved-items", JSON.stringify(newItems));
  };

  const handleRemoveItem = (indexToRemove) => {
    const updated = items.filter((_, idx) => idx !== indexToRemove);
    updateBasket(updated);
  };

  const handleStartPurchase = (indexToPurchase) => {
    setSelectedIndex(indexToPurchase);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedIndex(null);
  };

  const handleConfirmPurchase = () => {
    if (selectedIndex == null) return;

    const purchasedItem = items[selectedIndex];

    const existingPurchased = JSON.parse(
      localStorage.getItem("wsw-purchased-items") ?? "[]"
    );
    localStorage.setItem(
      "wsw-purchased-items",
      JSON.stringify([...existingPurchased, purchasedItem])
    );

    const updated = items.filter((_, idx) => idx !== selectedIndex);
    updateBasket(updated);

    setShowModal(false);
    setSelectedIndex(null);
  };

  const currentItem =
    selectedIndex != null ? items[selectedIndex] : null;

  return (
    <div>
      <h1 className="mb-3">My Basket</h1>

      {items.length === 0 ? (
        <Alert variant="secondary">
          You don&apos;t have any saved items yet. Visit the home page and
          save some outfit recommendations.
        </Alert>
      ) : (
        <Row className="g-3">
          {items.map((item, idx) => (
            <Col key={`${item.id}-${idx}`} xs={12} md={6} lg={4}>
              <ClothingCard
                {...{
                  item,
                  index: idx,
                  hideSave: true,
                  showBasketActions: true,
                  onRemove: handleRemoveItem,
                  onPurchase: handleStartPurchase
                }}
              />
            </Col>
          ))}
        </Row>
      )}

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Ready to purchase?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentItem && (
            <>
              <p>
                You&apos;re about to purchase{" "}
                <strong>{currentItem.name}</strong>.
              </p>
              {currentItem.buyUrl ? (
                <p>
                  Product link:{" "}
                  <a
                    href={currentItem.buyUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open product page
                  </a>
                </p>
              ) : (
                <p>
                  A product link will appear here.
                </p>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmPurchase}>
            I purchased this item!
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
