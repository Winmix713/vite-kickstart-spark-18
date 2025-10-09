console.log("main.tsx: Starting app initialization...");

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("main.tsx: Imports successful");

const rootElement = document.getElementById("root");
console.log("main.tsx: Root element found:", rootElement);

if (rootElement) {
  createRoot(rootElement).render(<App />);
  console.log("main.tsx: App rendered");
} else {
  console.error("main.tsx: Root element not found!");
}
