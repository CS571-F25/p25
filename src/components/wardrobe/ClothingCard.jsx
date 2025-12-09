import { useState } from "react";
import { Card, Button } from "react-bootstrap";

export default function ClothingCard(props) {
  const [expanded, setExpanded] = useState(false);

  const hasMoreInfo = Boolean(
    props.item.longDescription || props.item.buyUrl
  );

  const handleSaveClick = () => {
    if (props.onSave) {
      props.onSave(props.item);
    }
  };

  return (
    <Card className="h-100 d-flex flex-column">
      <Card.Body>
        <Card.Title>{props.item.name}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          {props.item.category} • {props.item.weatherTag}
        </Card.Subtitle>

        <Card.Text className="mb-0">{props.item.description}</Card.Text>

        {expanded && hasMoreInfo && (
          <div className="mt-2">
            {props.item.longDescription && (
              <Card.Text>{props.item.longDescription}</Card.Text>
            )}
            {props.item.buyUrl && (
              <div className="mt-2">
                <a href={props.item.buyUrl} target="_blank" rel="noreferrer">
                  View product page
                </a>
              </div>
            )}
          </div>
        )}
      </Card.Body>

      <Card.Footer className="d-flex justify-content-between gap-2">
        {hasMoreInfo && (
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Hide details" : "More details"}
          </Button>
        )}

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
  );
}
