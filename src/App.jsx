import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import React from "react";
import Sidebar from "./Sidebar";
import Login from "./Login";
import Ledger from "./Ledger";
import AllUsersRoute from "./AllUsersRoute"; // ✅ Import this
import AllUsers from "./AllUsers";

function App() {
  return (
    <Router>
      <Sidebar />
      <Routes>
        {/* <Route path="/" element={<Ledger />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/ledger" element={<Ledger />} />
        
        {/* ✅ Protect admin route properly */}
        <Route element={<AllUsersRoute />}>
  <Route path="/all-users" element={<AllUsers />} />
</Route>

        
        {/* ✅ Catch all unknown routes */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
