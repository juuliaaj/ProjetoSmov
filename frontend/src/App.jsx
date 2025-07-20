import { Routes, Route } from 'react-router-dom';
import LoginPage from "./pages/LoginPage";
import RecoverPassword from './pages/RecoverPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/recuperar" element={<RecoverPassword />} />
      <Route path="/resetar" element={<ResetPassword />} />

      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
}

export default App;
