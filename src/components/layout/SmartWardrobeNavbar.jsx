import { Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import crest from "../../assets/uw-crest.svg";

export default function SmartWardrobeNavbar() {
  return (
    <Navbar bg="dark" variant="dark" sticky="top" expand="sm" collapseOnSelect>
      <Container>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Brand as={Link} to="/">
          <img
            alt="UW Crest"
            src={crest}
            width="30"
            height="30"
            className="d-inline-block align-top me-2"
          />
          Weather Smart Wardrobe
        </Navbar.Brand>
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/basket">My Basket</Nav.Link>
            <Nav.Link as={Link} to="/purchases">Past Purchases</Nav.Link>
            <Nav.Link as={Link} to="/about">About</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
