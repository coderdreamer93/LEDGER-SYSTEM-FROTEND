import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
const API_URL = "https://ledger-system-backend.vercel.app/api/ledger";

export default function Ledger() {
  const [formData, setFormData] = useState({
    chequeNumber: "",
    itemDescription: "",
    personName: "",
    amount: "",
    // modelName: "",
    // quantity: "",
    // sales: "",
    // purchase: "",
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

  const [editingTransactionId, setEditingTransactionId] = useState(null);

  // ✅ Handle Update Ledger Entry
  // const handleEditClick = (transaction) => {
  //   setFormData({
  //     chequeNumber: transaction.chequeNumber || "",
  //     itemDescription: transaction.itemDescription || "",
  //     personName: transaction.personName || "",
  //     amount: transaction.amount || "",
  //     modelName: transaction.modelName || "",
  //     quantity: transaction.quantity || "",
  //     sales: transaction.sales || "",
  //     purchase: transaction.purchase || "",
  //     paymentType: transaction.paymentType || "cash",
  //   });

  //   setEditingTransactionId(transaction._id); // Selected Transaction ID Store Karna
  // };
  const handleEditClick = (transaction) => {
    setFormData({
      chequeNumber: transaction.chequeNumber || "",  // Cheque Number
      itemDescription: transaction.itemDescription || "", // Item Description
      personName: transaction.personName || "",  // Person Name
      amount: transaction.amount || "",  // Amount
      sales: transaction.sales || "",
      purchase: transaction.purchase || "",
      paymentType: transaction.paymentType || "cash",  // Payment Type
    });

    setEditingTransactionId(transaction._id); // Store transaction ID for updating
  };


  const handleUpdate = async () => {
    if (!editingTransactionId) {
      alert("No transaction selected for update!");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/${editingTransactionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update ledger entry");

      alert("Entry updated successfully!");
      fetchTransactions(); // Transactions Refresh Karna
      setFormData({
        // chequeNumber: "",
        // itemDescription: "",
        // personName: "",
        // amount: "",
        // modelName: "",
        // quantity: "",
        sales: "",
        purchase: "",
        paymentType: "cash",
        chequeNumber: "",  // Cheque Number
        itemDescription: "", // Item Description
        personName: "",  // Person Name
        amount: "",  // Amount
        paymentType: "cash",  // Payment Type
      });
      setEditingTransactionId(null);
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

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   const token = localStorage.getItem("token");

  //   // Check if required fields are filled
  //   // if (!formData.modelName || !formData.quantity || !formData.paymentType || !formData.amount || !formData.personName || !formData.chequeNumber) {
  //   //   alert("Please fill in all required fields!");
  //   //   return;
  //   // }

  //   try {
  //     // If editing a transaction (updating)
  //     if (editingTransactionId) {
  //       const response = await fetch(`${API_URL}/${editingTransactionId}`, {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify(formData),
  //       });

  //       if (!response.ok) throw new Error("Failed to update ledger entry");
  //       if (userId) {
  //         localStorage.setItem("userId", userId);
  //       }
  //       alert("Entry updated successfully!");
  //       fetchTransactions(); // Refresh transactions after update
  //     } else {
  //       // If no transaction is being edited, add a new one
  //       const response = await fetch(API_URL, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify(formData),
  //       });

  //       if (!response.ok) throw new Error("Failed to add ledger entry");

  //       alert("New entry added successfully!");
  //       fetchTransactions(); // Refresh transactions after adding new entry
  //     }

  //     // Reset form after submission
  //     setFormData({
  //       chequeNumber: "",
  //       itemDescription: "",

  //       // modelName: "",
  //       // quantity: "",
  //       sales: "",
  //       purchase: "",
  //       personName: "",
  //       amount: "",
  //       paymentType: "cash",
  //     });

  //     // Reset editingTransactionId if any
  //     setEditingTransactionId(null);

  //   } catch (err) {
  //     alert(err.message);
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      let response;
      if (editingTransactionId) {
        response = await fetch(`${API_URL}/${editingTransactionId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
      }

      if (!response.ok) throw new Error("Failed to process ledger entry");

      const data = await response.json();
      if (data.userId) {
        localStorage.setItem("userId", data.userId);
      }

      alert(editingTransactionId ? "Entry updated successfully!" : "New entry added successfully!");
      fetchTransactions();

      setFormData({
        chequeNumber: "",
        itemDescription: "",
        sales: "",
        purchase: "",
        personName: "",
        amount: "",
        paymentType: "cash",
      });
      setEditingTransactionId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const hasSufficientPurchases = transactions.some(transaction => transaction.purchase > 2);

  // const filteredTransactions = transactions.filter(
  //   (transaction) =>
  //     transaction.itemDescription.toLowerCase().includes(searchTerm) ||
  //     transaction.chequeNumber.toLowerCase().includes(searchTerm) ||
  //     transaction.personName.toLowerCase().includes(searchTerm) ||
  //     transaction.paymentType.toLowerCase().includes(searchTerm)
  // );

  const [searchTerm, setSearchTerm] = useState("");

  return (


    <div className="container mt-4">
      <h1 className="text-center mb-4">Ledger Management System</h1>
      {/* <div className="mb-3">

        <input
          type="text"
          className="form-control"
          placeholder="Search by cheque number, description, person name, or payment type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        />
      </div> */}

      {/* Form Section */}
      <form onSubmit={handleSubmit}>
        {/* Row 1: 6 Fields */}
        <div className="row">
          <div className="col-md-2">
            <label className="form-label">Cheque No:</label>
            <input
              type="number"
              name="chequeNumber"
              value={formData.chequeNumber}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Item Desc:</label>
            <input
              type="text"
              name="itemDescription"
              value={formData.itemDescription}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Person Name:</label>
            <input
              type="text"
              name="personName"
              value={formData.personName}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Amount:</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Sales:</label>
            <input
              type="number"
              name="sales"
              value={formData.sales}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          {/* <div className="col-md-2">
            <label className="form-label">Model Name:</label>
            <input
              type="text"
              name="modelName"
              value={formData.modelName}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div> */}
          {/* 
          <div className="col-md-2">
            <label className="form-label">Quantity:</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div> */}
        </div>

        {/* Row 2: 3 Fields + Submit Button */}
        <div className="row mt-3">
          {/* <div className="col-md-3">
            <label className="form-label">Sales:</label>
            <input
              type="number"
              name="sales"
              value={formData.sales}
              onChange={handleChange}
              className="form-control"
            />
          </div> */}

          <div className="col-md-3">
            <label className="form-label">Purchase:</label>
            <input
              type="number"
              name="purchase"
              value={formData.purchase}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="col-md-3">
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
          <div className="col-md-3">
          <label className="form-label">Search Filter:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by cheque number, description, person name, or payment type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            />
          </div>
          {/* Submit Button */}
          <div className="col-md-3 d-flex align-items-end">
            <button type="submit" className="btn btn-success w-100">
              Submit
            </button>
          </div>
        </div>
      </form>

      {/* Search Filter */}
        {/* <div className="mb-3">

          <input
            type="text"
            className="form-control"
            placeholder="Search by cheque number, description, person name, or payment type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          />
        </div> */}

      {/* Row 2: 3 Fields */}
      {/* <div className="row mt-3">
        <div className="col-md-4">
          <label className="form-label">Sales:</label>
          <input
            type="number"
            name="sales"
            value={formData.sales}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Purchase:</label>
          <input
            type="number"
            name="purchase"
            value={formData.purchase}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="col-md-4">
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
            <option value="accounts-receivable">A/R</option>
          </select>
        </div>
      </div> */}

      {/* Table Section */}

      {/* Table Section */}
      <div className="card mt-3 shadow-sm">
        <h3 className="text-center">Transaction Records</h3>
        {loading ? (
          <p className="text-center text-muted">Loading transactions...</p>
        ) : error ? (
          <p className="text-danger text-center">{error}</p>
        ) : hasSufficientPurchases ? (
          <div className="table-responsive">
            <table className="table table-bordered table-striped text-center mt-3">
              <thead className="table-light">
                <tr>
                  <th>S.No</th>
                  <th>Item Code</th>
                  <th>Cheque Number</th>
                  <th>Item Description</th>
                  <th>Sales</th>
                  <th>Purchase</th>
                  <th>Person Name</th>
                  <th>Amount</th>
                  <th>Payment Type</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions
                  .filter(transaction => transaction.purchase > 2) // Only show transactions where purchase > 2
                  .filter(transaction =>
                    transaction.chequeNumber.toString().includes(searchTerm) ||
                    transaction.itemDescription.toLowerCase().includes(searchTerm) ||
                    transaction.personName.toLowerCase().includes(searchTerm) ||
                    transaction.paymentType.toLowerCase().includes(searchTerm)
                  )
                  .map((transaction, index) => (
                    <tr key={transaction._id}>
                      <td>{index + 1}</td>
                      <td>{transaction.itemCode || "N/A"}</td>
                      <td>{transaction.chequeNumber || "N/A"}</td>
                      <td>{transaction.itemDescription || "N/A"}</td>
                      <td>{transaction.sales || "N/A"}</td>
                      <td>{transaction.purchase || "N/A"}</td>
                      <td>{transaction.personName || "N/A"}</td>
                      <td>{transaction.amount || "N/A"}</td>
                      <td>{transaction.paymentType}</td>
                      <td>
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => handleEditClick(transaction)}
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
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted text-center">No transactions with purchases greater than 2 found.</p>
        )}
      </div>
    </div>
  );
}
