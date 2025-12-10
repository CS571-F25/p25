import { Card, Button } from "react-bootstrap";

function getRetailerName(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./i, "").toLowerCase();

    if (host.includes("uniqlo")) return "Uniqlo";
    if (host.includes("hm.com") || host.includes("hm.")) return "H&M";
    if (host.includes("target")) return "Target";
    if (host.includes("zara")) return "Zara";
    if (host.includes("llbean") || host.includes("ll-bean")) return "L.L.Bean";
    if (host.includes("patagonia")) return "Patagonia";
    if (host.includes("arcteryx")) return "Arc'teryx";

    // Fallback: capitalized hostname
    return host
      .split(".")[0]
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return "Retailer";
  }
}

export default function ClothingCard(props) {
  const {
    item,
    hideSave,
    showBasketActions,
    onSave,
    onRemove,
    onPurchase,
    index,
    quantity
  } = props;

  const handleSaveClick = () => {
    if (onSave) {
      onSave(item);
    }
  };

  return (
    <Card className="h-100 d-flex flex-column">
      {item.image && (
        <Card.Img
          variant="top"
          src={item.image}
          alt={item.name}
          style={{ height: "200px", objectFit: "cover" }}
        />
      )}
      <Card.Body>
        <Card.Title>{item.name}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          {item.category} • {item.weatherTag}
        </Card.Subtitle>

        <Card.Text className="mb-0">{item.description}</Card.Text>

        {item.links && item.links.length > 0 && (
          <div className="mt-2">
            <span className="fw-semibold">Retailers:</span>
            <ul className="list-unstyled mb-0">
              {item.links.map((link, i) => (
                <li key={i}>
                  <a href={link} target="_blank" rel="noreferrer">
                    {getRetailerName(link)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card.Body>

      <Card.Footer className="d-flex justify-content-between align-items-center gap-2">
        {/* Left side: quantity for past purchases, if provided */}
        {typeof quantity === "number" && (
          <small
            className="text-muted"
            aria-label={`Quantity purchased: ${quantity}`}
          >
            Quantity purchased: <span className="fw-semibold">{quantity}</span>
          </small>
        )}

        {/* Right side: save / basket actions */}
        <div className="ms-auto d-flex gap-2">
          {!hideSave && (
            <Button size="sm" onClick={handleSaveClick}>
              Save to basket
            </Button>
          )}

          {showBasketActions && (
            <>
              <Button
                size="sm"
                variant="outline-danger"
                onClick={() => onRemove && onRemove(index)}
              >
                Remove
              </Button>
              <Button
                size="sm"
                variant="success"
                onClick={() => onPurchase && onPurchase(index)}
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
