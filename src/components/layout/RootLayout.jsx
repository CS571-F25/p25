import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";
import SmartWardrobeNavbar from "./SmartWardrobeNavbar";

export default function RootLayout() {
  return (
    <>
      <SmartWardrobeNavbar />
      <main className="mt-4 mb-4">
        <Container>
          <Outlet />
        </Container>
      </main>
    </>
  );
}
