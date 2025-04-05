import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { handleLogout } from "./Logout";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap

const Sidebar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const checkLoginStatus = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", checkLoginStatus);
    return () => {
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, []);

  return (
    <>
      {/* Sidebar Toggle Button */}
      <button
        className="btn btn-white btn-sm position-fixed m-2 d-flex align-items-center justify-content-center"
        style={{ width: "35px", height: "35px", padding: "0" }}
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#sidebarMenu"
        aria-controls="sidebarMenu"
      >
        <FaBars />
      </button>

      {/* Bootstrap Offcanvas Sidebar */}
      <div
        className="offcanvas offcanvas-start text-bg-dark"
        tabIndex="-1"
        id="sidebarMenu"
        aria-labelledby="sidebarMenuLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="sidebarMenuLabel">
            Ledger System
          </h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body d-flex flex-column">
          <ul className="nav flex-column">
            <li className="nav-item">
              <Link className="nav-link text-white" to="/ledger">
                Ledger
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/all-users">
                All Users
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/stock-report">
                Stock Report
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/ledger-history">
                Total Ledger History
              </Link>
            </li>
          </ul>

          <div className="mt-auto">
            {isLoggedIn ? (
              <Link
                to="/"
                className="btn btn-primary w-100"
                onClick={() => {
                  handleLogout();
                  setIsLoggedIn(false);
                }}
              >
                Logout
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary w-100">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
