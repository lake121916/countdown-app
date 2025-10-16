import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  CalendarDays,
  BarChart3,
  ArrowLeftCircle,
  Eye,
  Check,
  X,
  Trash,
} from "lucide-react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";
import "./AdminPanel.css";

const AdminPanel = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [dashboardEvents, setDashboardEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // ------------------- DATA FETCHING FUNCTIONS -------------------
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "users"));
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching users:", err);
    }
    setLoading(false);
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "events"));
      setEvents(
        snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
          };
        })
      );
    } catch (err) {
      console.error("Error fetching events:", err);
    }
    setLoading(false);
  }, []);

  const fetchDashboard = useCallback(async () => {
    if (!currentUser) return;
    try {
      const snapshot = await getDocs(
        collection(db, "users", currentUser.uid, "dashboard")
      );
      setDashboardEvents(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (err) {
      console.error("Error fetching dashboard:", err);
    }
  }, [currentUser]);

  // ------------------- LOAD DATA -------------------
  useEffect(() => {
    if (currentUser?.isAdmin) {
      fetchUsers();
      fetchEvents();
      fetchDashboard();
    }
  }, [currentUser, fetchUsers, fetchEvents, fetchDashboard]);

  // ------------------- HELPERS -------------------
  const formatDate = (date) => {
    if (!date) return "N/A";
    if (date.seconds) {
      const d = new Date(date.seconds * 1000);
      return d.toLocaleDateString();
    }
    return date;
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      fetchUsers();
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handleApproveEvent = async (eventId) => {
    try {
      await updateDoc(doc(db, "events", eventId), { status: "approved" });
      fetchEvents();
    } catch (err) {
      console.error("Error approving event:", err);
    }
  };

  const handleRejectEvent = async (eventId) => {
    try {
      await updateDoc(doc(db, "events", eventId), { status: "rejected" });
      fetchEvents();
    } catch (err) {
      console.error("Error rejecting event:", err);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteDoc(doc(db, "events", eventId));
      fetchEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  const displayedEvents = showPendingOnly
    ? events.filter((event) => event.status === "pending_admin")
    : events;

  if (!currentUser) return <p>Loading...</p>;
  if (!currentUser.isAdmin) return <p>Access denied. You are not an admin.</p>;

  // ------------------- UI -------------------
  return (
    <div className="admin-panel-container">
      {/* Sidebar */}
      <div className={`admin-tabs-vertical ${isCollapsed ? "collapsed" : ""}`}>
        <button
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          <ArrowLeftCircle
            className={`collapse-icon ${isCollapsed ? "rotated" : ""}`}
          />
        </button>

        <button
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}
        >
          <Users />
          {!isCollapsed && <span>Users</span>}
        </button>

        <button
          className={activeTab === "events" ? "active" : ""}
          onClick={() => setActiveTab("events")}
        >
          <CalendarDays />
          {!isCollapsed && <span>Events</span>}
        </button>

        <button
          className={activeTab === "dashboard" ? "active" : ""}
          onClick={() => setActiveTab("dashboard")}
        >
          <BarChart3 />
          {!isCollapsed && <span>Dashboard</span>}
        </button>
      </div>

      {/* Main Content */}
      <div className={`admin-main-content ${isCollapsed ? "expanded" : ""}`}>
        {/* USERS TAB */}
        {activeTab === "users" && (
          <>
            <h2>User Management</h2>
            {loading ? (
              <p>Loading users...</p>
            ) : users.length === 0 ? (
              <p>No users found.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Full Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Change Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id}>
                      <td>{index + 1}</td>
                      <td>{user.fullName || "N/A"}</td>
                      <td>{user.phoneNumber || "N/A"}</td>
                      <td>{user.email}</td>
                      <td>{user.role || "user"}</td>
                      <td>
                        <select
                          value={user.role || "user"}
                          onChange={(e) =>
                            handleChangeRole(user.id, e.target.value)
                          }
                        >
                          <option value="admin">Admin</option>
                          <option value="head">Head</option>
                          <option value="worker">Worker</option>
                          <option value="user">User</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="view-btn"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye size={16} /> View
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash size={16} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* EVENTS TAB */}
        {activeTab === "events" && (
          <>
            <h2>Event Management</h2>
            <button
              className="admin-btn"
              onClick={() => setShowPendingOnly(!showPendingOnly)}
            >
              {showPendingOnly ? "Show All Events" : "Show Pending Only"}
            </button>

            {loading ? (
              <p>Loading events...</p>
            ) : displayedEvents.length === 0 ? (
              <p>No events found.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Proposed By</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedEvents.map((ev) => (
                    <tr key={ev.id}>
                      <td>{ev.title || ev.name}</td>
                      <td>{ev.proposedBy || "N/A"}</td>
                      <td>{formatDate(ev.date)}</td>
                      <td>{ev.status || "N/A"}</td>
                      <td>
                        <button
                          className="view-btn"
                          onClick={() => setSelectedEvent(ev)}
                        >
                          <Eye size={16} /> View
                        </button>
                        <button
                          className="approve-btn"
                          onClick={() => handleApproveEvent(ev.id)}
                        >
                          <Check size={16} /> Approve
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => handleRejectEvent(ev.id)}
                        >
                          <X size={16} /> Reject
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteEvent(ev.id)}
                        >
                          <Trash size={16} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <>
            <h2>My Dashboard</h2>
            {dashboardEvents.length === 0 ? (
              <p>No events added yet.</p>
            ) : (
              <div className="dashboard-grid">
                {dashboardEvents.map((event) => (
                  <div key={event.id} className="dashboard-card">
                    <h4>{event.title}</h4>
                    <p>{event.description}</p>
                    <p>
                      <strong>Date:</strong> {formatDate(event.date)}
                    </p>
                    {event.imageURL && (
                      <img src={event.imageURL} alt="event" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* User Modal */}
      {selectedUser && (
        <div className="admin-modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>User Details</h3>
            <p><strong>Name:</strong> {selectedUser.fullName || "N/A"}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Phone:</strong> {selectedUser.phoneNumber || "N/A"}</p>
            <p><strong>Role:</strong> {selectedUser.role || "User"}</p>
            <button className="delete-btn" onClick={() => setSelectedUser(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {selectedEvent && (
        <div className="admin-modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedEvent.title}</h3>
            <p><strong>Proposed By:</strong> {selectedEvent.proposedBy || "N/A"}</p>
            <p><strong>Date:</strong> {formatDate(selectedEvent.date)}</p>
            <p><strong>Status:</strong> {selectedEvent.status}</p>
            <p><strong>Description:</strong> {selectedEvent.description}</p>
            {selectedEvent.imageURL && (
              <img src={selectedEvent.imageURL} alt="event" />
            )}
            <button className="delete-btn" onClick={() => setSelectedEvent(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;