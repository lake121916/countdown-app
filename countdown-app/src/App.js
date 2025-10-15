// src/App.js
import React from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import { AuthProvider, useAuth } from "./components/AuthContext";
import EventList from "./components/EventList";
import AdminPanel from "./components/AdminPanel";
import Login from "./components/login";
import Signup from './components/Signup';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";  // ✅ import Footer
import ApprovalPanel from "./components/ApprovalPanel"; // Head approval panel
import WorkerDashboard from "./components/WorkerDashboard";
import Dashboard from "./components/Dashboard";
import Contact from "./components/Contact";
import AboutUs from "./components/About";


// Private route wrapper with role-based access
function PrivateRoute({ children, allowedRoles = [] }) {
  const { currentUser } = useAuth();

  if (!currentUser) return <Navigate to="/login" />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* ✅ Layout wrapper to push footer down */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <Navbar />

          {/* Main content grows */}
          <div style={{ flex: 1, padding: "20px", marginTop: "60px" }}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<EventList />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<AboutUs />} />  

              {/* Normal user dashboard */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute allowedRoles={["normal"]}>
                    <Dashboard />
                  </PrivateRoute>
                }
              />

              {/* Worker dashboard */}
              <Route
                path="/worker"
                element={
                  <PrivateRoute allowedRoles={["worker"]}>
                    <WorkerDashboard />
                  </PrivateRoute>
                }
              />

              {/* Head approval panel */}
              <Route
                path="/head"
                element={
                  <PrivateRoute allowedRoles={["head"]}>
                    <ApprovalPanel />
                  </PrivateRoute>
                }
              />

              {/* Admin panel */}
              <Route
                path="/admin"
                element={
                  <PrivateRoute allowedRoles={["admin"]}>
                    <AdminPanel />
                  </PrivateRoute>
                }
              />

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>

          {/* ✅ Footer always at bottom */}
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

