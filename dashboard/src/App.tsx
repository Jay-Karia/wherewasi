import './App.css';

import AppBar from './components/app-bar';
import Main from './components/main';
import { ThemeProvider } from './components/providers/theme-provider';
import Toolbar from './components/toolbar';
import { TooltipProvider } from './components/ui/tooltip';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-key">
      <TooltipProvider>
        <div>
          <AppBar />
        </div>
        <div className="flex items-center justify-center pt-12">
          <Toolbar />
        </div>
        <div className="flex justify-center items-center mt-8 mx-12">
          <Main />
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
