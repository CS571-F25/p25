import { HashRouter, Routes, Route } from "react-router";
import "./App.css";

import RootLayout from "./components/layout/RootLayout";
import SearchPage from "./components/pages/SearchPage";
import RecommendationsPage from "./components/pages/RecommendationsPage";
import BasketPage from "./components/pages/BasketPage";
import PastPurchasesPage from "./components/pages/PastPurchasesPage";
import AboutPage from "./components/pages/AboutPage";
import NotFoundPage from "./components/pages/NotFoundPage";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<SearchPage />} />
          <Route path="recommendations" element={<RecommendationsPage />} />
          <Route path="basket" element={<BasketPage />} />
          <Route path="purchases" element={<PastPurchasesPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
