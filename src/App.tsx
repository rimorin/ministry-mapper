import "bootstrap/dist/css/bootstrap.min.css";
import { HelmetProvider } from "react-helmet-async";
import Navigation from "./components/navigation";

function App() {
  return (
    <HelmetProvider>
      <Navigation />
    </HelmetProvider>
  );
}

export default App;
