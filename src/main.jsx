import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// I use createRoot to tell React where my app should be shown in the HTML
const root = createRoot(document.getElementById("root"));

// I wrap my whole app in BrowserRouter so I can use routes like /login and /dashboard
root.render(
  <BrowserRouter>
    {/* This is my main App component where all my pages are set up */}
    <App />
  </BrowserRouter>
);
