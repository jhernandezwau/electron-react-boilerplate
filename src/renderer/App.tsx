import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { UpgradeToolInterface } from './views/UpgradeToolInterface';
import './App.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UpgradeToolInterface />} />
      </Routes>
    </Router>
  );
}