import { useLocation, useNavigate } from 'react-router-dom';
import './BottomTabBar.css';

const tabs = [
  { key: '/', icon: '🏠', label: '홈' },
  { key: '/board', icon: '📋', label: '게시판' },
  { key: 'write', icon: '✏️', label: '글쓰기' },
  { key: 'ai', icon: '👦', label: 'AI검색' },
  { key: '/my-posts', icon: '📝', label: '내 작성글' },
];

function BottomTabBar({ onAIOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleTab = (key) => {
    if (key === 'ai') {
      onAIOpen?.();
      return;
    }
    if (key === 'write') {
      // 게시판 페이지가 아니면 게시판으로 이동
      if (!location.pathname.startsWith('/board')) {
        navigate('/board?write=1');
      } else {
        // 이미 게시판이면 write 쿼리 토글
        const params = new URLSearchParams(location.search);
        if (params.get('write')) {
          params.delete('write');
        } else {
          params.set('write', '1');
        }
        navigate(`/board?${params.toString()}`);
      }
      return;
    }
    navigate(key);
  };

  const isActive = (key) => {
    if (key === 'write' || key === 'ai') return false;
    if (key === '/') return location.pathname === '/';
    return location.pathname.startsWith(key);
  };

  return (
    <nav className="bottom-tab-bar" aria-label="메인 탐색">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`tab-item ${isActive(tab.key) ? 'active' : ''} ${tab.key === 'write' ? 'tab-write' : ''}`}
          onClick={() => handleTab(tab.key)}
          aria-label={tab.label}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default BottomTabBar;
