import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import "./ProductList.css";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("/api/auth/me", {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then(res => {
        if (res.status === 401) {
          navigate("/login");
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data) setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        navigate("/login");
      });
  }, [navigate]);

  if (loading)
    return (
      <div className="dashboard-loading">
        <div className="modern-loader"></div>
      </div>
    );
  if (!user) return null;

  return (
    <div className="dashboard-modern-bg">
      <div className="dashboard-modern-wrapper">
        <ProfileCard user={user} />
        <div className="dashboard-modern-cards">
          {user.role === "admin" ? <AdminPanel /> : <UserPanel />}
        </div>
      </div>
    </div>
  );
}

function ProfileCard({ user }) {
  return (
    <div className="dashboard-modern-profile">
      <div className="profile-avatar">
        {(user.name?.[0] || user.firstName?.[0] || "U").toUpperCase()}
      </div>
      <div>
        <div className="profile-name">{user.name || user.firstName}</div>
        <div className="profile-email">{user.email}</div>
        <div className="profile-role">{user.role}</div>
      </div>
    </div>
  );
}

function UserPanel() {
  const navigate = useNavigate();
  return (
    <>
      <DashboardCard
        label="My Orders"
        color="#2196f3"
        onClick={() => window.location.href = "/orders"}
        icon="📦"
      />
      <DashboardCard
        label="Track Order"
        color="#4caf50"
        onClick={() => navigate("/track-order")}
        icon="📍"
      />
      <DashboardCard
        label="Wishlist"
        color="#e91e63"
        onClick={() => window.location.href = "/wishlist"}
        icon="💖"
      />
      <DashboardCard
        label="Profile Settings"
        color="#ff9800"
        onClick={() => navigate("/profile-settings")}
        icon="⚙️"
      />
    </>
  );
}

function AdminPanel() {
  return (
    <>
      <DashboardCard
        label="Manage Products"
        color="#2196f3"
        onClick={() => window.location.href = "/admin/products"}
        icon="📦"
      />
      <DashboardCard
        label="Manage Orders"
        color="#4caf50"
        onClick={() => window.location.href = "/admin/orders"}
        icon="🛒"
      />
      <DashboardCard
        label="Manage Users"
        color="#ff5722"
        onClick={() => window.location.href = "/admin/users"}
        icon="👥"
      />
      <DashboardCard
        label="View Analytics"
        color="#9c27b0"
        onClick={() => window.location.href = "/admin/analytics"}
        icon="📊"
      />
    </>
  );
}

function DashboardCard({ label, onClick, icon, color }) {
  const [active, setActive] = useState(false);
  return (
    <div
      className={`dashboard-modern-card${active ? " active" : ""}`}
      style={{
        borderLeft: `7px solid ${color}`,
        boxShadow: active
          ? `0 4px 18px 0 ${color}40`
          : "0 2px 8px 0 rgba(40,44,63,0.07)",
      }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      onMouseLeave={() => setActive(false)}
      onClick={onClick}
      tabIndex={0}
      role="button"
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          setActive(true);
          setTimeout(() => setActive(false), 150);
          onClick();
        }
      }}
    >
      <div
        className="dashboard-modern-icon"
        style={{ color: color, background: `${color}20` }}
      >
        {icon}
      </div>
      <div className="dashboard-modern-label">{label}</div>
      <span
        className="dashboard-modern-arrow"
        style={{ color: color }}
      >
        →
      </span>
    </div>
  );
}