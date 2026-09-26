import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../api/apiClient";

function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      // ======================================================
      // Get token saved during login
      // ======================================================

      const token = localStorage.getItem("token");

      if (!token) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // ======================================================
      // Verify current user from backend
      // ======================================================

      const response = await API.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(
        "AdminRoute user:",
        response.data
      );

      // ======================================================
      // Check role
      // ======================================================

      if (
        response.data?.status === "success" &&
        response.data?.user?.role === "admin"
      ) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }

    } catch (error) {
      console.error(
        "Admin authorization error:",
        error
      );

      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================
  // Checking permission
  // ========================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-sm font-semibold text-slate-600">
          Checking permissions...
        </div>
      </div>
    );
  }

  // ========================================================
  // Not admin
  // ========================================================

  if (!isAdmin) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  // ========================================================
  // Admin
  // ========================================================

  return children;
}

export default AdminRoute;