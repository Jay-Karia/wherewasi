import "./App.css";
import AppBar from "./components/app-bar";
import { ThemeProvider } from "./components/providers/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-key">
      <div>
        <AppBar />
      </div>
    </ThemeProvider>
  );
}

export default App;
