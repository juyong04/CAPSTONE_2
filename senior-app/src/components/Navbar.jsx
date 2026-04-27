import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const navItems = [
  { path: '/', label: '홈' },
  { path: '/monthly-topic', label: '이달의 주제' },
  { path: '/counseling', label: '고민상담' },
  { path: '/freeboard', label: '자유게시판' },
  { path: '/education', label: '교육 게시판' },
];

function Navbar() {
  const location = useLocation();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          🌿 시니어 커뮤니티
        </Link>
        <nav className="navbar-links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
