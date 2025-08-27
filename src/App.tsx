import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HousePricePredictor from './pages/HousePricePredictor';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HousePricePredictor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;