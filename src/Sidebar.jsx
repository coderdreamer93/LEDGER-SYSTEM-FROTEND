import React, { useState, useEffect } from "react";
import "./Sidebar.css"; // Sidebar styles
import { Link } from "react-router-dom"; // Use Link for navigation
import { FaBars, FaTimes } from "react-icons/fa"; // Import icons
import { handleLogout } from "./Logout";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const checkLoginStatus = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };

    // Listen for storage changes to update login status dynamically
    window.addEventListener("storage", checkLoginStatus);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Sidebar Toggle Button */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <nav className={`sidebar ${isOpen ? "open" : ""}`}>
        <h2 className="sidebar-title">Ledger System</h2>

        <ul className="sidebar-links">
          <li><Link to="/ledger">Ledger</Link></li>
          <li><Link to="/all-users">All Users</Link></li>
        </ul>

        <div className="sidebar-auth">
          {isLoggedIn ? (
            <Link to="/" onClick={() => {
              handleLogout();
              setIsLoggedIn(false); // Update state on logout
            }} className="logout-btn">Logout</Link>
          ) : (
            <Link to="/login" className="login-btn">Login</Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
