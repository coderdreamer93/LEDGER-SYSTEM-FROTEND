import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

export default function LowPurchaseLedger() {
  const [lowPurchaseLedgers, setLowPurchaseLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (token && userId) {
      setUserId(userId);
      fetchLowPurchaseLedgers(userId, token);
    } else {
      setError("User ID or Token is missing.");
      setLoading(false);
    }
  }, []);

  const fetchLowPurchaseLedgers = async (userId, token) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://ledger-system-backend.vercel.app/api/ledger/low-purchase/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error: ${response.status}`);
      }

      setLowPurchaseLedgers(data.ledgers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`https://ledger-system-backend.vercel.app/api/ledger/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }

      setLowPurchaseLedgers(lowPurchaseLedgers.filter(txn => txn._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({ ...transaction });
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`https://ledger-system-backend.vercel.app/api/ledger/${formData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update transaction");
      }

      setLowPurchaseLedgers(prev => prev.map(txn => txn._id === formData._id ? formData : txn));
      setEditingTransaction(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card p-4 shadow-sm">
      <Sidebar />
      {editingTransaction && (
        <div className="mt-4">
          <h4>Edit Transaction</h4>
          <label className="form-label">Sales:</label>
          <input
            type="number"
            value={formData.sales}
            onChange={(e) => setFormData({ ...formData, sales: e.target.value })}
            placeholder="Item Description"
          />
          <label className="form-label">Purchase:</label>
          <input
            type="number"
            value={formData.purchase}
            onChange={(e) => setFormData({ ...formData, purchase: e.target.value })}
            placeholder="Purchase"
          />
          <button className="btn btn-primary mt-2" onClick={handleUpdate}>Save</button>
        </div>
      )}

      <h3 className="text-center">Low Purchase Transactions</h3>
      {loading ? (
        <p className="text-center text-muted">Loading transactions...</p>
      ) : error ? (
        <p className="text-danger text-center">{error}</p>
      ) : lowPurchaseLedgers.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-bordered table-striped text-center mt-3">
            <thead className="table-light">
              <tr>
                <th>S.No</th>
                <th>Cheque Number</th>
                <th>Item Description</th>
                <th>Sales</th>
                <th>Purchase</th>
                <th>Person Name</th>
                <th>Amount</th>
                <th>Payment Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lowPurchaseLedgers.map((transaction, index) => (
                <tr key={transaction._id}>
                  <td>{index + 1}</td>
                  <td>{transaction.chequeNumber || "N/A"}</td>
                  <td>{transaction.itemDescription || "N/A"}</td>
                  <td>{transaction.sales || "N/A"}</td>
                  <td className="bg-danger">{transaction.purchase || "N/A"}</td>
                  <td>{transaction.personName || "N/A"}</td>
                  <td>{transaction.amount || "N/A"}</td>
                  <td>{transaction.paymentType}</td>
                  <td>
                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleEditClick(transaction)}>
                      Update
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(transaction._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-muted text-center">No low purchase transactions found.</p>
      )}
      {/* {editingTransaction && (
        <div className="mt-4">
          <h4>Edit Transaction</h4>
          <label className="form-label">Sales:</label>
          <input
            type="number"
            value={formData.sales}
            onChange={(e) => setFormData({ ...formData, sales: e.target.value })}
            placeholder="Item Description"
          />
          <label className="form-label">Purchase:</label>
          <input
            type="number"
            value={formData.purchase}
            onChange={(e) => setFormData({ ...formData, purchase: e.target.value })}
            placeholder="Purchase"
          />
          <button className="btn btn-primary mt-2" onClick={handleUpdate}>Save</button>
        </div>
      )} */}
    </div>
  );
}
