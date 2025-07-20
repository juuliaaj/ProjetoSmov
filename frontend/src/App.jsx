import { Routes, Route } from 'react-router-dom';
import LoginPage from "./pages/LoginPage";
import DonationPage from "./pages/DonationPage";
import HomeInicial from './pages/HomeInicial';
import Mapeamento from './pages/mapeamento';
import RecoverPassword from './pages/RecoverPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeInicial />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/recuperar" element={<RecoverPassword />} />
      <Route path="/resetar" element={<ResetPassword />} />
      <Route path="/doacoes" element={<DonationPage />} />
      <Route path="/mapa" element={<Mapeamento />} />

      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
}

export default App;
