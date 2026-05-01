import './CategoryChips.css';

function CategoryChips({ boards, active, onChange }) {
  return (
    <div className="chip-bar">
      {boards.map(b => (
        <button
          key={b.key}
          className={`chip ${active === b.key ? 'chip-active' : ''}`}
          onClick={() => onChange(b.key)}
        >
          <span className="chip-emoji">{b.emoji}</span>
          <span className="chip-label">{b.label}</span>
        </button>
      ))}
    </div>
  );
}

export default CategoryChips;
