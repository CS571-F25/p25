import { useState, useEffect } from "react";
import { Card, Button, Modal } from "react-bootstrap";

export default function ClothingCard(props) {
  const [randomLink, setRandomLink] = useState(null);
  const [linkClicked, setLinkClicked] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Check if this item has been marked as link-clicked in localStorage
  useEffect(() => {
    if (props.item && props.item.id) {
      const visitedLinks = JSON.parse(
        localStorage.getItem("wsw-visited-links") ?? "{}"
      );
      if (visitedLinks[props.item.id]) {
        setLinkClicked(true);
        setShowPurchaseModal(true);
      }
    }
  }, [props.item]);

  const handleSaveClick = () => {
    if (props.onSave) {
      props.onSave(props.item);
    }
  };

  const getRandomLink = () => {
    if (props.item.links && props.item.links.length > 0) {
      const randomIndex = Math.floor(Math.random() * props.item.links.length);
      return props.item.links[randomIndex];
    }
    return null;
  };

  const handleImageClick = () => {
    const link = getRandomLink();
    if (link) {
      window.open(link, "_blank");
    }
  };

  const handleLinkClick = (e) => {
    const newLink = getRandomLink();
    setRandomLink(newLink);
    
    // Mark this item's link as clicked in localStorage
    const visitedLinks = JSON.parse(
      localStorage.getItem("wsw-visited-links") ?? "{}"
    );
    visitedLinks[props.item.id] = true;
    localStorage.setItem("wsw-visited-links", JSON.stringify(visitedLinks));
    
    setLinkClicked(true);
    // Don't prevent default - let the link navigate normally
  };

  const handlePurchaseConfirmed = () => {
    if (props.onPurchaseConfirmed) {
      props.onPurchaseConfirmed(props.item, props.index);
    }
    // Clear the visited link marker
    const visitedLinks = JSON.parse(
      localStorage.getItem("wsw-visited-links") ?? "{}"
    );
    delete visitedLinks[props.item.id];
    localStorage.setItem("wsw-visited-links", JSON.stringify(visitedLinks));
    
    setShowPurchaseModal(false);
    setLinkClicked(false);
  };

  const handlePurchaseSkipped = () => {
    // Clear the visited link marker but don't add to purchases
    const visitedLinks = JSON.parse(
      localStorage.getItem("wsw-visited-links") ?? "{}"
    );
    delete visitedLinks[props.item.id];
    localStorage.setItem("wsw-visited-links", JSON.stringify(visitedLinks));
    
    setShowPurchaseModal(false);
    setLinkClicked(false);
  };

  const displayLink = randomLink || getRandomLink();

  return (
    <>
      <Card className="h-100 d-flex flex-column">
        {props.item.image && (
          <Card.Img
            variant="top"
            src={props.item.image}
            alt={props.item.name}
            style={{ cursor: "pointer", height: "200px", objectFit: "cover" }}
            onClick={handleImageClick}
          />
        )}
        <Card.Body>
          <Card.Title>{props.item.name}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            {props.item.category} • {props.item.weatherTag}
          </Card.Subtitle>

          <Card.Text className="mb-0">{props.item.description}</Card.Text>

          {props.item.links && props.item.links.length > 0 && (
            <div className="mt-2">
              <a
                href={displayLink}
                target="_blank"
                rel="noreferrer"
                className="d-block mb-1"
                onClick={handleLinkClick}
              >
                Visit the website
              </a>
            </div>
          )}
        </Card.Body>

        <Card.Footer className="d-flex justify-content-between gap-2">
          <div className="ms-auto d-flex gap-2">
            {!props.hideSave && (
              <Button size="sm" onClick={handleSaveClick}>
                Save to basket
              </Button>
            )}

            {props.showBasketActions && (
              <>
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() =>
                    props.onRemove && props.onRemove(props.index)
                  }
                >
                  Remove
                </Button>
                <Button
                  size="sm"
                  variant="success"
                  onClick={() =>
                    props.onPurchase && props.onPurchase(props.index)
                  }
                >
                  Purchase!
                </Button>
              </>
            )}
          </div>
        </Card.Footer>
      </Card>

      {/* Purchase confirmation modal that appears after visiting the link */}
      <Modal show={showPurchaseModal} onHide={handlePurchaseSkipped} centered>
        <Modal.Header closeButton>
          <Modal.Title>Did you purchase this item?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            You visited the website for <strong>{props.item.name}</strong>.
          </p>
          <p>Did you end up purchasing this item?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handlePurchaseSkipped}>
            No, not yet
          </Button>
          <Button variant="success" onClick={handlePurchaseConfirmed}>
            Yes, I purchased it!
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
