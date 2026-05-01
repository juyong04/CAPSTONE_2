import { Link } from 'react-router-dom';
import './TopHeader.css';

function TopHeader() {
  return (
    <header className="top-header">
      <Link to="/" className="top-header-logo">
        <span className="top-header-icon">🌿</span>
        <span className="top-header-title">시니어 커뮤니티</span>
      </Link>
      <Link to="/notice" className="top-header-action" aria-label="공지사항">
        🔔
      </Link>
    </header>
  );
}

export default TopHeader;
