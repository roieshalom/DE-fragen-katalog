import "./style.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

if (import.meta.env.PROD) {
  (function(c, l, a, r, i, t, y) {
    c[a] = c[a] || function() { (c[a].q = c[a].q || []).push(arguments) };
    t = l.createElement(r); t.async = 1;
    t.src = "https://www.clarity.ms/tag/qyg3chkjg3";
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
