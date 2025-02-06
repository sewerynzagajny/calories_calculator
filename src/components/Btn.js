export default function Button({ type, style, onClick, children, loading }) {
  return (
    <button
      type={type}
      style={style}
      onClick={!loading ? onClick : null}
      disabled={loading}
      className={`button ${loading ? "button--loading" : ""}`}
    >
      {children}
    </button>
  );
}
