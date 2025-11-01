import { Routes, Route } from 'react-router-dom';
import LoginPage from "./pages/LoginPage";
import DonationPage from "./pages/DonationPage";
import HomeInicial from './pages/HomeInicial';
import Mapeamento from './pages/Mapeamento';
import ReservationPage from './pages/ReservationPage';
import RecoverPassword from './pages/RecoverPassword';
import ResetPassword from './pages/ResetPassword';
import OngRegisterPage from './pages/OngRegisterPage';
import AdminDashboard from "./pages/AdminDashboard";
import ONGsPage from './pages/ONGsPage';
import UserProfile from './pages/UserProfile';
import PerfilOng from './pages/OngsProfile';

import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Routes>
          <Route path="/" element={<HomeInicial />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recuperar" element={<RecoverPassword />} />
          <Route path="/resetar" element={<ResetPassword />} />
          <Route path="/doacoes" element={<DonationPage />} />
          <Route path="/mapeamento" element={<Mapeamento />} />
          <Route path="/reservas" element={<ReservationPage />} />
          <Route path="/ongs" element={<ONGsPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/cadastro" element={<OngRegisterPage />} />
          <Route path="/perfil" element={<UserProfile />} />
          <Route path="/perfil/:id" element={<UserProfile />} />
          <Route path="/perfil-ong" element={<PerfilOng />} />
          <Route path="/perfil-ong/:id" element={<PerfilOng />} />

          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </ThemeProvider>
    </LocalizationProvider>
  );
}

export default App;
