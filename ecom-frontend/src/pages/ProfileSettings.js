import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import "./ProfileSettings.css";

export default function ProfileSettings() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Fetching user data...");
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetch("/api/auth/me", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          navigate("/login");
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          setUser(data);
          setForm({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || ""
          });
        }
        setLoading(false);
      });
  }, [navigate]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    fetch("/api/auth/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(data => {
        if (data.error || data.msg) {
          setMessage(data.error || data.msg);
        } else {
          setMessage("Profile updated successfully!");
        }
      })
      .catch(() => setMessage("Error updating profile."));
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="page-background">
      <div className="dashboard-container">
        <h2>Profile Settings</h2>
        <form onSubmit={handleSubmit} className="profile-form">
          <label>
            First Name:
            <input name="firstName" value={form.firstName} onChange={handleChange} />
          </label>
          <label>
            Last Name:
            <input name="lastName" value={form.lastName} onChange={handleChange} />
          </label>
          <label>
            Email:
            <input name="email" value={form.email} onChange={handleChange} />
          </label>
          {/* You can add password change fields here */}
          <button type="submit">Update Profile</button>
        </form>
        {message && <div className="profile-message">{message}</div>}
      </div>
    </div>
  );
}
