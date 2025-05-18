export function Button({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "20px 40px",
        backgroundColor: "#0070f3",
        border: "none",
        borderRadius: "12px",
        color: "white",
        fontSize: "18px",
        cursor: "pointer",
        margin: "10px",
        backgroundImage: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      {children}
    </button>
  );
}