import { HashRouter, Route, Routes } from 'react-router'
import './App.css'
import Home from './components/Home'
import AboutMe from './components/AboutMe'
import Basket from './components/Basket'
import Forecast from './components/Forecast'
import PrimaryNavbar from './components/PrimaryNavbar'

function App() {
  return <HashRouter>
    <PrimaryNavbar />
    <div className="container mt-4">
      <Routes>
        <Route path="/" element={<Home/>}></Route>
        <Route path="/about" element={<AboutMe/>}></Route>
        <Route path="/forecast" element={<Forecast/>}></Route>
        <Route path="/basket" element={<Basket/>}></Route>
      </Routes>
    </div>
  </HashRouter>
}

export default App
