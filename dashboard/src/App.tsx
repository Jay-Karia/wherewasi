import "./App.css";
import AppBar from "./components/app-bar";
import { ThemeProvider } from "./components/providers/theme-provider";
import Toolbar from "./components/toolbar";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-key">
      <div>
        <AppBar />
      </div>
      <div className="flex items-center justify-center pt-12">
        <Toolbar />
      </div>
    </ThemeProvider>
  );
}

export default App;
