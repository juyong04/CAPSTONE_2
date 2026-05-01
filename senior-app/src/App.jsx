import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopHeader from './components/TopHeader';
import BottomTabBar from './components/BottomTabBar';
import Home from './pages/Home';
import Board from './pages/Board';
import Notice from './pages/Notice';
import NoticeDetail from './pages/NoticeDetail';
import MyPosts from './pages/MyPosts';
import GrandsonSearch from './components/GrandsonSearch';
import { useState } from 'react';
import './App.css';

function App() {
  const [isAIOpen, setIsAIOpen] = useState(false);

  return (
    <Router>
      <div className="app-shell">
        <TopHeader />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/board" element={<Board />} />
            <Route path="/notice" element={<Notice />} />
            <Route path="/notice/:id" element={<NoticeDetail />} />
            <Route path="/my-posts" element={<MyPosts />} />
          </Routes>
        </main>
        <BottomTabBar onAIOpen={() => setIsAIOpen(true)} />
        <GrandsonSearch isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
      </div>
    </Router>
  );
}

export default App;
