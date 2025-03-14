import { useEffect, useState } from "react";
import "./AllUsers.css";

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

  // Handle permission toggle
  const handlePermissionToggle = async (id, permission) => {
    try {
      const userToUpdate = users.find((user) => user._id === id);
      if (!userToUpdate) return;

      const updatedPermissions = {
        ...userToUpdate.permissions,
        [permission]: !userToUpdate.permissions[permission],
      };

      // Send updated permissions to the API
      const response = await fetch(
        "https://ledger-system-backend.vercel.app/api/auth/assign-permissions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: id, permissions: updatedPermissions }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update permissions");
      }

      setUsers(
        users.map((user) =>
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
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error creating user:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="all-users-container">
      <h2 className="title">Admin User Management</h2>
      {message && <p className="success-message">{message}</p>}

      {loading ? (
        <p className="loading-text">Loading users...</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Permissions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.name}</td>
                <td>{user.role}</td>
                <td>
                  <label>
                    <input
                      type="checkbox"
                      checked={user.permissions?.can_view || false}
                      onChange={() => handlePermissionToggle(user._id, "can_view")}
                    />
                    View
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={user.permissions?.can_edit || false}
                      onChange={() => handlePermissionToggle(user._id, "can_edit")}
                    />
                    Edit
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={user.permissions?.can_delete || false}
                      onChange={() => handlePermissionToggle(user._id, "can_delete")}
                    />
                    Delete
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button className="create-user-button" onClick={() => setShowModal(true)}>
        Create New User
      </button>

      {/* Modal for new user creation */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Create New User</h3>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={newUser.name}
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={newUser.email}
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={newUser.password}
              onChange={handleChange}
            />
            <select name="role" value={newUser.role} onChange={handleChange}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button className="submit-button" onClick={handleCreateUser}>
              Submit
            </button>
            <button className="cancel-button" onClick={() => setShowModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
