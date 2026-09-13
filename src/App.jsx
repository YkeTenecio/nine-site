import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import AdminPage from './pages/AdminPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

export default App;