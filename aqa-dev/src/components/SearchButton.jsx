export function SearchButton({ q }) {
  return (
    <a
      href={`https://www.google.com/search?q=${encodeURIComponent(q)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="glow-btn"
      style={{
        display: "inline-flex",
        width: "fit-content",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        color: "#58A6FF",
        fontFamily: "'JetBrains Mono',monospace",
        padding: "2px 7px",
        background: "#0D1117",
        borderRadius: 4,
        border: "1px solid #21262D",
        cursor: "pointer",
        textDecoration: "none",
        maxWidth: "100%",
        "--gc": "#58A6FF20",
      }}
    >
      <svg
        width={11}
        height={11}
        viewBox="0 0 16 16"
        fill="none"
        style={{ flexShrink: 0 }}
      >
        <circle cx="7" cy="7" r="5" stroke="#58A6FF" strokeWidth={1.5} />
        <path
          d="M11 11l3.5 3.5"
          stroke="#58A6FF"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </svg>
      <span
        className="lava-s"
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          backgroundImage: "linear-gradient(90deg,#58A6FF,#6DB4FF,#4C96FF,#58A6FF)",
        }}
      >
        {q}
      </span>
      <svg
        width={10}
        height={10}
        viewBox="0 0 16 16"
        fill="none"
        style={{ flexShrink: 0 }}
      >
        <path
          d="M5 11L11 5M11 5H6M11 5V10"
          stroke="#58A6FF"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}
