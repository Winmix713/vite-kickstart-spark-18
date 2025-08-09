import React from "react";

// 1. Globális beolvasás a két mappából
const componentModules = import.meta.glob(
  [
    "/_imports/liga-soccer-cra/src/components/**/*.jsx",
    "/_imports/liga-soccer-cra/src/widgets/**/*.jsx"
  ],
  { eager: true }
);

// 2. Objektumból tömb készítése
const componentsList = Object.entries(componentModules).map(([path, module], index) => {
  const name = path.split("/").pop().replace(".jsx", "");
  const Component = module.default;
  return {
    id: index + 1,
    name,
    path,
    Component
  };
});

export default function ComponentShowcase() {
  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>
        📦 Component & Widget Showcase
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px"
        }}
      >
        {componentsList.map(({ id, name, path, Component }) => (
          <div
            key={id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "15px",
              background: "#fafafa",
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
            }}
          >
            <div style={{ marginBottom: "10px", borderBottom: "1px solid #eee", paddingBottom: "8px" }}>
              <strong>#{id} - {name}</strong>
              <div style={{ fontSize: "12px", color: "#888" }}>{path}</div>
            </div>
            <div style={{ background: "white", padding: "10px", borderRadius: "4px" }}>
              {Component ? <Component /> : <em>Nincs default export</em>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
