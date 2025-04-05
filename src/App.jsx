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
import LowPurchaseLedger from "./LowLedgerHistory";
import StockReport from './StockReport'

function App() {
  return (
    <Router>
      <Sidebar />
      <Routes>
        {/* <Route path="/" element={<Ledger />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/ledger" element={<Ledger />} />
          <Route path="/ledger-history" element={<LowPurchaseLedger />} />
          <Route path="/stock-report" element={<StockReport />} />

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
