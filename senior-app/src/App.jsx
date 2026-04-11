import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MonthlyTopic from './pages/MonthlyTopic';
import Counseling from './pages/Counseling';
import FreeBoard from './pages/FreeBoard';
import Education from './pages/Education';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/monthly-topic" element={<MonthlyTopic />} />
            <Route path="/counseling" element={<Counseling />} />
            <Route path="/freeboard" element={<FreeBoard />} />
            <Route path="/education" element={<Education />} />
          </Routes>
        </main>
        <footer className="footer">
          <p>© 2025 시니어 커뮤니티 · 함께하는 즐거운 노후</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
