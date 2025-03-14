import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Ledger.css";

const API_URL = "https://ledger-system-backend.vercel.app/api/ledger/ledger";
const PERMISSIONS_API = "https://ledger-system-backend.vercel.app/api/auth/get-permissions";

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
    const [userPermissions, setUserPermissions] = useState({});
    const navigate = useNavigate();

    // Fetch user permissions on mount
    useEffect(() => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        if (!token) {
            alert("You are not logged in. Redirecting to login...");
            navigate("/login");
        } else {
            fetchUserPermissions(userId, token);
            fetchTransactions(token);
        }
    }, [navigate]);

    // Fetch User Permissions
    const fetchUserPermissions = async (userId, token) => {
        try {
            const response = await fetch(`${PERMISSIONS_API}/${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch user permissions");
            }

            const data = await response.json();
            setUserPermissions(data.permissions || {});
        } catch (err) {
            console.error("Error fetching user permissions:", err);
            setUserPermissions({});
        }
    };

    // Fetch Transactions
    const fetchTransactions = async (token) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(API_URL, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Fetched Data:", data);
            setTransactions(data.ledgers || data || []);
        } catch (err) {
            console.error("Error fetching transactions:", err);
            setError(err.message || "Failed to fetch transactions.");
        } finally {
            setLoading(false);
        }
    };

    // Handle Input Changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle Form Submission (Check Edit Permission)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        if (!userPermissions.can_edit) {
            alert("You do not have permission to edit records!");
            return;
        }

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

            if (!response.ok) {
                throw new Error("Failed to add ledger entry.");
            }

            alert("Ledger entry added successfully!");
            setFormData({
                modelName: "",
                quantity: "",
                sales: "",
                purchase: "",
                paymentType: "cash",
            });
            fetchTransactions(token);
        } catch (err) {
            console.error("Error submitting data:", err);
            alert(err.message);
        }
    };

    return (
        <div className="ledger-container">
            <h1 className="ledger-title">Ledger Management System</h1>

            {/* Form Section */}
            <div className="ledger-form">
                <h3 className="form-title">Enter Transaction Details</h3>
                <form onSubmit={handleSubmit}>
                    <label>Model Name:</label>
                    <input type="text" name="modelName" value={formData.modelName} onChange={handleChange} required />

                    <label>Quantity:</label>
                    <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />

                    <label>Sale Details:</label>
                    <input type="text" name="sales" value={formData.sales} onChange={handleChange} />

                    <label>Purchase Details:</label>
                    <input type="text" name="purchase" value={formData.purchase} onChange={handleChange} />

                    <label>Payment Type:</label>
                    <select name="paymentType" value={formData.paymentType} onChange={handleChange} required>
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

                    <button className="submit-button" type="submit">Submit</button>
                </form>
            </div>

            {/* Transactions Table */}
            <div className="ledger-table">
                <h3 className="table-title">Transaction Records</h3>
                {loading ? (
                    <p>Loading transactions...</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : transactions.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Model Name</th>
                                <th>Item Code</th>
                                <th>Quantity</th>
                                <th>Sales</th>
                                <th>Purchase</th>
                                <th>Payment Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((transaction) => (
                                <tr key={transaction._id}>
                                    <td>{transaction.modelName}</td>
                                    <td>{transaction.itemCode || "N/A"}</td>
                                    <td>{transaction.quantity}</td>
                                    <td>{transaction.sales || "N/A"}</td>
                                    <td>{transaction.purchase || "N/A"}</td>
                                    <td>{transaction.paymentType}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No transactions found.</p>
                )}
            </div>
        </div>
    );
}
