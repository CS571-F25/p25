import React from 'react'
import { Navbar, Nav, Container } from 'react-bootstrap'

export default function PrimaryNavbar() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="#/">Weather Smart Wardrobe</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="#/">Home</Nav.Link>
            <Nav.Link href="#/forecast">Forecast</Nav.Link>
            <Nav.Link href="#/basket">Basket</Nav.Link>
            <Nav.Link href="#/about">About</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
