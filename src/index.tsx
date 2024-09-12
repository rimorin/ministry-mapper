import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Main from "./pages/index";

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <Main />
    </StrictMode>
  );
} else {
  console.error("Root element not found");
}
