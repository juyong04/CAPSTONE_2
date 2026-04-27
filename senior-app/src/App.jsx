import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MonthlyTopic from './pages/MonthlyTopic';
import Counseling from './pages/Counseling';
import FreeBoard from './pages/FreeBoard';
import Education from './pages/Education';
import './App.css';
import Notice from './pages/Notice'; // ⭐ 추가
import NoticeDetail from './pages/NoticeDetail';
import GrandsonSearch from './components/GrandsonSearch';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        <GrandsonSearch />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/monthly-topic" element={<MonthlyTopic />} />
            <Route path="/counseling" element={<Counseling />} />
            <Route path="/freeboard" element={<FreeBoard />} />
            <Route path="/education" element={<Education />} />
                {/* ⭐ 추가: 공지사항 페이지 라우팅 */}
            <Route path="/notice" element={<Notice />} />
            <Route path="/notice/:id" element={<NoticeDetail />} />
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
