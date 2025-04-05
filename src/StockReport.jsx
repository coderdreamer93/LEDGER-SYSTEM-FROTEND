import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
const API_URL = "https://ledger-system-backend.vercel.app/api/reports";  // POST API URL for reports
const GET_REPORTS_URL = "https://ledger-system-backend.vercel.app/api/reports/all";  // GET API URL to fetch all reports
const DELETE_REPORT_URL = "https://ledger-system-backend.vercel.app/api/reports";  // DELETE API URL for reports
const UPDATE_REPORT_URL = "https://ledger-system-backend.vercel.app/api/reports";  // UPDATE API URL for reports

export default function Reports() {
    const [formData, setFormData] = useState({
        province: "",
        reportType: "",
        comments: "",
        _id: "" // To track the ID of the report being updated
    });

    const [reports, setReports] = useState([]);  // Ensure reports is initialized as an empty array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const reportTypes = [
        { value: "Led", label: "Led" },
        { value: "AB", label: "AB" },
        { value: "C COVER", label: "C COVER" },
        { value: "D COVER", label: "D COVER" },
        { value: "CABLE", label: "CABLE" },
        { value: "HINGES", label: "HINGES" },
        { value: "POWER PIN", label: "POWER PIN" },
        { value: "MOTHERBOARD", label: "MOTHERBOARD" },
        { value: "BATTERY", label: "BATTERY" },
        { value: "KEYBOARD", label: "KEYBOARD" },
        { value: "FAN", label: "FAN" },
        { value: "SPEAKER", label: "SPEAKER" }
    ];

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("You are not logged in. Redirecting to login...");
            navigate("/login");
        } else {
            fetchReports();
        }
    }, [navigate]);

    // Fetch reports
    const fetchReports = async () => {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");

        if (!token) {
            setError("Authentication token not found!");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(GET_REPORTS_URL, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error(`Error: ${response.status}`);

            const data = await response.json();
            console.log("Fetched Data:", data); // Log the response

            if (Array.isArray(data.report)) {
                setReports(data.report);  // Set reports state correctly
            } else {
                setReports([]);  // Set to empty if reports is not an array
            }
        } catch (err) {
            setError(err.message); // Set error state
        } finally {
            setLoading(false); // Set loading to false after the request completes
        }
    };

    // Handle form data changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submit (create/update report)
    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        if (!token) {
            setError("Authentication token not found!");
            return;
        }

        try {
            const url = formData._id ? `${UPDATE_REPORT_URL}/${formData._id}` : API_URL;
            const method = formData._id ? "PUT" : "POST";  // Use PUT for updating an existing report

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error(`Error: ${response.status}`);

            fetchReports();  // Reload the reports after successful submission
            setFormData({ province: "", reportType: "", comments: "", _id: "" });  // Clear form

        } catch (err) {
            setError(err.message);
        }
    };

    // Handle delete report
    const handleDelete = async (id) => {
        const token = localStorage.getItem("token");

        if (!token) {
            setError("Authentication token not found!");
            return;
        }

        try {
            const response = await fetch(`${DELETE_REPORT_URL}/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error(`Error: ${response.status}`);

            fetchReports();  // Reload the reports after deleting
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle edit (update) report
    const handleEdit = (report) => {
        setFormData({
            province: report.province,
            reportType: report.reportType,
            comments: report.comments,
            _id: report._id, // Store the ID of the report to be updated
        });
    };

    return (
        <div className="container mt-4">
            <h1 className="text-center mb-4">Report Management System</h1>

            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-md-3">
                        <label className="form-label">Province:</label>
                        <input
                            type="text"
                            name="province"
                            required
                            value={formData.province}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>

                    {/* <div className="col-md-3">
                        <label className="form-label">Report Type:</label>
                        <input
                            type="text"
                            name="reportType"
                            value={formData.reportType}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div> */}
                    <div className="col-md-3">
                        <label className="form-label">Report Type:</label>
                        <select
                            name="reportType"
                            value={formData.reportType}
                            onChange={handleChange}
                            className="form-control"
                        >
                            {/* <option value="">Select Report Type</option> */}
                            {reportTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-3">
                        <label className="form-label">Comments:</label>
                        <input
                            type="text"
                            name="comments"
                            required
                            value={formData.comments}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>

                    <div className="col-md-3 d-flex align-items-end">
                        <button type="submit" className="btn btn-success w-100">
                            {formData._id ? "Update" : "Submit"}
                        </button>
                    </div>
                </div>
            </form>

            <div className="card mt-3 shadow-sm">
                <h3 className="text-center">Report Records</h3>
                {loading ? (
                    <p className="text-center text-muted">Loading reports...</p>
                ) : error ? (
                    <p className="text-danger text-center">{error}</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped text-center mt-3">
                            <thead className="table-light">
                                <tr>
                                    <th>S.No</th>
                                    <th>Province</th>
                                    <th>Report Type</th>
                                    <th>Comments</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.length > 0 ? (
                                    reports.map((report, index) => (
                                        <tr key={report._id}>
                                            <td>{index + 1}</td>
                                            <td>{report.province || "N/A"}</td>
                                            <td>{report.reportType || "N/A"}</td>
                                            <td>{report.comments || "N/A"}</td>
                                            <td>
                                                <button
                                                    className="btn btn-warning me-2"
                                                    onClick={() => handleEdit(report)}
                                                >
                                                    Update
                                                </button>
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() => handleDelete(report._id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5">No reports available.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
