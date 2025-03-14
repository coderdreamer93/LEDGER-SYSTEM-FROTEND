import { Navigate, Outlet } from "react-router-dom";

const AllUsersRoute = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  return token && user?.role === "admin" ? <Outlet /> : <Navigate to="/ledger" />;
};

export default AllUsersRoute;
