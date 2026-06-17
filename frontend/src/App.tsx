import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { HomePage } from './pages/HomePage';
import { RoutePage } from './pages/RoutePage';
import { StoryPage } from './pages/StoryPage';

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/route" element={<RoutePage />} />
          <Route path="/story" element={<StoryPage />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
