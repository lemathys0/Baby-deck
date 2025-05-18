import React from "react";

export default function MessageBox({ type = "info", message }) {
  const colors = {
    success: "#d4edda",
    error: "#f8d7da",
    info: "#d1ecf1",
    warning: "#fff3cd",
  };

  const borders = {
    success: "#c3e6cb",
    error: "#f5c6cb",
    info: "#bee5eb",
    warning: "#ffeeba",
  };

  return (
    <div
      style={{
        backgroundColor: colors[type] || colors.info,
        border: `1px solid ${borders[type] || borders.info}`,
        padding: "10px 15px",
        borderRadius: "6px",
        marginTop: "10px",
        fontWeight: "bold",
      }}
    >
      {message}
    </div>
  );
}
