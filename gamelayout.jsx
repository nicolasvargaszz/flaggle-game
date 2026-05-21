/**
 * GameLayout — consistent shell for both games.
 * Provides a back button, title, and centred content area.
 */
export default function GameLayout({ title, emoji, onBack, children, className = "" }) {
  return (
    <div className={`game-layout ${className}`.trim()}>
      <header className="game-header">
        <button className="btn btn-ghost back-btn" onClick={onBack}>
          ← Volver
        </button>
        <h2 className="game-title">
          {emoji} {title}
        </h2>
        <span /> {/* spacer */}
      </header>
      <main className="game-content">{children}</main>
    </div>
  );
}
