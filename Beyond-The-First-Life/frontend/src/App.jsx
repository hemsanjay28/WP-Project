import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserApp from "./pages/UserApp";
import AdminApp from "./pages/AdminApp";
import Verify from "./pages/Verify";

function Protected({children,role}) {
  const {user} = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === "admin" ? "/admin" : "/app"} replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/verify/:id" element={<Verify/>}/>
        <Route path="/app/*" element={<Protected role="user"><UserApp/></Protected>}/>
        <Route path="/admin/*" element={<Protected role="admin"><AdminApp/></Protected>}/>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </AuthProvider>
  );
}
