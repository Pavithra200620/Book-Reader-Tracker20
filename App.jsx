import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Sidebar from "./components/Sidebar";
import NotificationBell from "./components/NotificationBell";

function PrivateRoute({ children }) {
  return localStorage.getItem("token") ? children : <Navigate to="/login" />;
}

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="top-bar-fixed">
          <NotificationBell />
        </div>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const isAuth = ["/login", "/register"].includes(location.pathname);
  const token = localStorage.getItem("token");

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={
        <PrivateRoute>
          <AppLayout><Dashboard /></AppLayout>
        </PrivateRoute>
      } />
      <Route path="/settings" element={
        <PrivateRoute>
          <AppLayout><Settings /></AppLayout>
        </PrivateRoute>
      } />
    </Routes>
  );
}