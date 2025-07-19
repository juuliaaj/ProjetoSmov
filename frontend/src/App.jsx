import { Routes, Route } from 'react-router-dom';
import LoginPage from "./pages/LoginPage";
import DonationPage from "./pages/DonationPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/doacoes" element={<DonationPage />} />
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
}

export default App;
