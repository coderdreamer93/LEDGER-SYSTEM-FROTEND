import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
const API_URL = "https://ledger-system-backend.vercel.app/api/ledger";

export default function Ledger() {
  const [formData, setFormData] = useState({
    modelName: "",
    quantity: "",
    sales: "",
    purchase: "",
    paymentType: "cash",
  });

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You are not logged in. Redirecting to login...");
      navigate("/login");
    } else {
      fetchTransactions(token);
    }
  }, [navigate]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Authentication token not found!");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("https://ledger-system-backend.vercel.app/api/ledger/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();
      setTransactions(data.ledgers || data || []); // Store ledger entries
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle Update Ledger Entry
  const handleUpdate = async (id) => {
    const token = localStorage.getItem("token");
    const updatedData = { ...formData }; // Modify as needed

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error("Failed to update ledger entry");

      alert("Entry updated successfully!");
      fetchTransactions(); // Refresh transactions
    } catch (err) {
      alert(err.message);
    }
  };

  // ✅ Handle Delete Ledger Entry
  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");

    if (!window.confirm("Are you sure you want to delete this entry?")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete ledger entry");

      alert("Entry deleted successfully!");
      setTransactions((prev) => prev.filter((entry) => entry._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!formData.modelName || !formData.quantity || !formData.paymentType) {
      alert("Please fill in all required fields!");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();
      console.log("Response Data:", responseData); // Debugging line

      if (!response.ok) throw new Error("Failed to save ledger entry");

      alert("Entry added successfully!");

      // Update transactions state without refetching
      setTransactions((prev) => [...prev, responseData]);

      setFormData({
        modelName: "",
        quantity: "",
        sales: "",
        purchase: "",
        paymentType: "cash",
      });

    } catch (err) {
      alert(err.message);
    }
  };


  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Ledger Management System</h1>

      {/* Form Section */}
      <div className="card p-4 shadow-sm mb-4">
        <h3 className="text-center">Enter Transaction Details</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Model Name:</label>
            <input
              type="text"
              name="modelName"
              value={formData.modelName}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Quantity:</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Sale Details:</label>
            <input
              type="number"
              name="sales"
              value={formData.sales}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Purchase Details:</label>
            <input
              type="number"
              name="purchase"
              value={formData.purchase}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Payment Type:</label>
            <select
              name="paymentType"
              value={formData.paymentType}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="cash">Cash</option>
              <option value="credit">Credit</option>
              <option value="accounts-receivable">Accounts Receivable</option>
              <option value="accounts-cheque">A/R Cheque</option>
              <option value="warranty">Warranty</option>
              <option value="return">Return</option>
              <option value="cash-paid">Cash Paid</option>
              <option value="cheque-paid">Cheque Paid</option>
              <option value="cheque-withdraw">Cheque Withdraw</option>
              <option value="a/r online">A/R Online</option>
              <option value="cheque-deposit">Cheque Deposit</option>
            </select>
          </div>

          <button className="btn btn-success w-100">Submit</button>
        </form>
      </div>

      {/* Table Section */}
      <div className="card p-4 shadow-sm">
        <h3 className="text-center">Transaction Records</h3>
        {loading ? (
          <p className="text-center text-muted">Loading transactions...</p>
        ) : error ? (
          <p className="text-danger text-center">{error}</p>
        ) : transactions.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-bordered table-striped text-center mt-3">
              <thead className="table-dark">
                <tr>
                  <th>Model Name</th>
                  <th>Item Code</th>
                  <th>Quantity</th>
                  <th>Sales</th>
                  <th>Purchase</th>
                  <th>Total Quantity</th>
                  <th>Payment Type</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => {
                  const quantity = parseInt(transaction.quantity, 10) || 0;
                  const sales = parseInt(transaction.sales, 10) || 0;
                  const purchase = parseInt(transaction.purchase, 10) || 0;
                  const totalQuantity = quantity - sales + purchase;

                  console.log(
                    `Transaction: ${transaction.modelName}, Total Quantity: ${totalQuantity}`
                  );

                  return (
                    <tr key={transaction._id}>
                      <td>{transaction.modelName}</td>
                      <td>{transaction.itemCode || "N/A"}</td>
                      <td>{quantity}</td>
                      <td>{sales || "N/A"}</td>
                      <td>{purchase || "N/A"}</td>
                      <td
                        className={totalQuantity <= 2 ? "low-stock-cell" : ""}
                      >
                        {totalQuantity}
                      </td>
                      <td>{transaction.paymentType}</td>
                      <td>
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => handleUpdate(transaction._id)}
                        >
                          Update
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(transaction._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted text-center">No transactions found.</p>
        )}
      </div>
    </div>
  );
}
