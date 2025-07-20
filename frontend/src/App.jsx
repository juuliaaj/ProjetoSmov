import { Routes, Route } from 'react-router-dom';
import LoginPage from "./pages/LoginPage";
import DonationPage from "./pages/DonationPage";
import HomeInicial from './pages/HomeInicial';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/doacoes" element={<DonationPage />} />
      <Route path="/inicial" element={<HomeInicial />} />
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
}

export default App;
