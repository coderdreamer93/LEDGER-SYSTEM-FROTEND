import { useEffect, useState } from "react";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState(""); // Success/Error Message
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          "https://ledger-system-backend.vercel.app/api/users/users"
        );
        const data = await response.json();
        setUsers(data.filter((user) => user.role !== "admin")); // Exclude admins
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle input change for new user creation
  const handleChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  // Handle permission toggle (Removed "can_view" functionality)
  const handlePermissionToggle = async (id, permission) => {
    try {
      const userToUpdate = users.find((user) => user._id === id);
      if (!userToUpdate) return;

      const updatedPermissions = {
        ...userToUpdate.permissions,
        [permission]: !userToUpdate.permissions?.[permission] || false, // Toggle permission
      };

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await fetch(
        "https://ledger-system-backend.vercel.app/api/auth/assign-permission",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: id, permission: updatedPermissions }),
        }
      );

      if (response.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("token");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to update permissions");
      }

      // ✅ Real-time update without refresh
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === id ? { ...user, permissions: updatedPermissions } : user
        )
      );

      setMessage(`Permission updated successfully for ${userToUpdate.name}`);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error updating permission:", error);
      alert("Failed to update permissions");
    }
  };



  // Handle new user creation
  const handleCreateUser = async () => {
    try {
      const response = await fetch(
        "https://ledger-system-backend.vercel.app/api/users/create-user",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to create user");
      }

      setUsers([...users, responseData]); // Update users list
      setShowModal(false);
      setMessage("User created successfully!");
      setTimeout(() => {
        window.location.reload(); // Refresh after success
      }, 200);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error creating user:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Admin User Management</h2>
      {message && <div className="alert alert-success">{message}</div>}

      {loading ? (
        <p className="text-center text-secondary">Loading users...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Password</th>
                <th>Role</th>
                <th>Permissions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user._id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.password}</td>
                  <td>{user.role}</td>
                  <td>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={user.permissions?.can_update || false} // Ensure correct state
                        onChange={() => handlePermissionToggle(user._id, "can_update")}
                      />
                      <label className="form-check-label">Edit</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={user.permissions?.can_delete || false} // Ensure correct state
                        onChange={() => handlePermissionToggle(user._id, "can_delete")}
                      />
                      <label className="form-check-label">Delete</label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        className="btn btn-success mt-3"
        onClick={() => setShowModal(true)}
      >
        Create New User
      </button>

      {/* Modal for new user creation */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New User</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  name="name"
                  className="form-control mb-2"
                  placeholder="Name"
                  value={newUser.name}
                  onChange={handleChange}
                />
                <input
                  type="email"
                  name="email"
                  className="form-control mb-2"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={handleChange}
                />
                <input
                  type="password"
                  name="password"
                  className="form-control mb-2"
                  placeholder="Password"
                  value={newUser.password}
                  onChange={handleChange}
                />
                <select
                  name="role"
                  className="form-select mb-2"
                  value={newUser.role}
                  onChange={handleChange}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleCreateUser}>
                  Submit
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
