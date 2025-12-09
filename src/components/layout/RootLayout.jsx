import { Outlet } from "react-router";
import { Container } from "react-bootstrap";
import SmartWardrobeNavbar from "./SmartWardrobeNavbar";

export default function RootLayout() {
  return (
    <div>
      <SmartWardrobeNavbar />
      <Container className="mt-4 mb-4">
        <Outlet />
      </Container>
    </div>
  );
}
