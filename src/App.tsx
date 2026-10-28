import AppRoutes from "./routes";
import { ScrollToTop } from "./components/ScrollToTop";

function App() {
  return (
    <>
      {/* Mounted above the routes so every screen gets the reset without
          each page having to remember it. */}
      <ScrollToTop />
      <AppRoutes />
    </>
  );
}

export default App;
