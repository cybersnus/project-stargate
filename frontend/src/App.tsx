import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SoundProvider } from './contexts/SoundContext';
import { Layout } from './components/Layout';
import { Introduction } from './components/Introduction';
import { TrainingSelector } from './components/TrainingSelector';
import { ShapeTraining } from './components/ShapeTraining';
import { ImageTraining } from './components/ImageTraining';
import { LocationTraining } from './components/LocationTraining';
import { Statistics } from './components/Statistics';

function App() {
  return (
    <SoundProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Introduction />} />
            <Route path="training" element={<TrainingSelector />} />
            <Route path="training/shape" element={<ShapeTraining />} />
            <Route path="training/image" element={<ImageTraining />} />
            <Route path="training/location" element={<LocationTraining />} />
            <Route path="statistics" element={<Statistics />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Analytics />
    </SoundProvider>
  );
}

export default App;
