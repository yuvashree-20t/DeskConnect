
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Tasks from "./pages/Tasks";
import Tickets from "./pages/Tickets";
import AdminTickets from "./pages/AdminTickets";
import AdminEmployees from "./pages/AdminEmployees";
import AdminTasks from "./pages/AdminTasks";

import "./App.css";

function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />;
  }

  return children;
}

function HomeRedirect() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <Navigate
      to={user.role === "admin" ? "/admin" : "/"}
      replace
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={() => {}} />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <ProtectedRoute requiredRole="employee">
              <Dashboard onLogout={() => {}} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute requiredRole="employee">
              <Tasks />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tickets"
          element={
            <ProtectedRoute requiredRole="employee">
              <Tickets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard onLogout={() => {}} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/tickets"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminTickets />
            </ProtectedRoute>
          }
        />
            
        <Route
  path="/admin/employees"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminEmployees />
    </ProtectedRoute>
  }
         />

         <Route
    path="/admin/tasks"
    element={
        <ProtectedRoute requiredRole="admin">
            <AdminTasks />
        </ProtectedRoute>
    }
          />
          <Route
    path="/admin/tickets"
    element={
        <ProtectedRoute requiredRole="admin">
            <AdminTickets />
        </ProtectedRoute>
    }
          />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
