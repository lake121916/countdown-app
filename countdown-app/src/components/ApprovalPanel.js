import { useState, useEffect, useCallback } from "react";
import { db } from "../firebase";
import "./ApprovalPanel.css";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp,
  addDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import Navbar from "./Navbar";
import { useAuth } from "./AuthContext";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";

// ✅ Lucide icons
import {
  PlusCircle,
  Clock,
  Send,
  LayoutDashboard,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";

function HeadApprovalPanel() {
  const { currentUser } = useAuth();
  const [pendingEvents, setPendingEvents] = useState([]);
  const [submittedEvents, setSubmittedEvents] = useState([]);
  const [dashboardEvents, setDashboardEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("add");

  const [title, setTitle] = useState("");
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventType, setEventType] = useState("expo");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [image, setImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);

  const today = new Date().toISOString().split("T")[0];
  const eventTypes = [
    { value: "expo", label: "Expo" },
    { value: "forum", label: "Forum" },
    { value: "hackathon", label: "Hackathon" },
    { value: "workshop", label: "Workshop" },
    { value: "conference", label: "Conference" },
    { value: "meeting", label: "Meeting" },
    { value: "other", label: "Other" },
  ];

  // ------------------ FETCH FUNCTIONS ------------------
  const fetchPendingEvents = useCallback(async () => {
    const q = query(collection(db, "events"), where("status", "==", "pending_head"));
    const snapshot = await getDocs(q);
    setPendingEvents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  }, []);

  const fetchSubmittedEvents = useCallback(async () => {
    if (!currentUser) return;
    const q = query(collection(db, "events"), where("proposedById", "==", currentUser.uid));
    const snapshot = await getDocs(q);
    setSubmittedEvents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  }, [currentUser]);

  const fetchDashboardEvents = useCallback(async () => {
    if (!currentUser) return;
    const snapshot = await getDocs(collection(db, "users", currentUser.uid, "dashboard"));
    setDashboardEvents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  }, [currentUser]);

  // ------------------ EFFECT HOOK ------------------
  useEffect(() => {
    fetchPendingEvents();
    fetchSubmittedEvents();
    fetchDashboardEvents();
  }, [fetchPendingEvents, fetchSubmittedEvents, fetchDashboardEvents]);

  // ------------------ ACTIONS ------------------
  const editEvent = (event) => {
    setActiveTab("add");
    setIsEditing(true);
    setCurrentEventId(event.id);
    setTitle(event.title);
    setEventName(event.eventName);
    setDescription(event.description);
    setLocation(event.location);
    setEventType(event.eventType);
    setDate(event.date);
    setTime(event.time);
  };

  const handleSaveEvent = async () => {
    if (!title || !eventName || !description || !location || !date || !time)
      return alert("Please fill all fields.");

    const fullDate = new Date(`${date}T${time}`);
    if (fullDate < new Date()) return alert("Event date must be in the future.");

    let imageURL = "";
    if (image) imageURL = await uploadToCloudinary(image);

    const eventData = {
      title,
      eventName,
      description,
      location,
      eventType,
      date,
      time,
      fullDate: fullDate.toISOString(),
      proposedBy: currentUser.email,
      proposedById: currentUser.uid,
      status: "pending_admin",
      updatedAt: serverTimestamp(),
      ...(imageURL && { imageURL }),
    };

    if (isEditing) {
      await updateDoc(doc(db, "events", currentEventId), eventData);
      alert("Event updated successfully!");
    } else {
      await addDoc(collection(db, "events"), eventData);
      alert("Event submitted successfully!");
    }

    setTitle("");
    setEventName("");
    setDescription("");
    setLocation("");
    setEventType("expo");
    setDate("");
    setTime("");
    setImage(null);
    setIsEditing(false);
    setCurrentEventId(null);
    fetchSubmittedEvents();
  };

  const handleApprove = async (id) => {
    await updateDoc(doc(db, "events", id), {
      status: "pending_admin",
      headApprovedAt: serverTimestamp(),
    });
    fetchPendingEvents();
    alert("Event approved!");
  };

  const handleReject = async (id) => {
    await updateDoc(doc(db, "events", id), {
      status: "rejected_by_head",
      headRejectedAt: serverTimestamp(),
    });
    fetchPendingEvents();
    alert("Event rejected!");
  };

  const addToDashboard = async (event) => {
    await setDoc(doc(db, "users", currentUser.uid, "dashboard", event.id), {
      ...event,
      savedAt: new Date().toISOString(),
    });
    fetchDashboardEvents();
    alert(`"${event.title}" added to your dashboard!`);
  };

  const removeFromDashboard = async (eventId) => {
    await deleteDoc(doc(db, "users", currentUser.uid, "dashboard", eventId));
    fetchDashboardEvents();
    alert("Removed from your dashboard!");
  };

  // ------------------ RENDER ------------------
  return (
    <div className="approval-page">
      <Navbar />

      {/* ✅ Sidebar Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "add" ? "active" : ""}
          onClick={() => setActiveTab("add")}
        >
          <PlusCircle size={18} /> Add Event
        </button>
        <button
          className={activeTab === "pending" ? "active" : ""}
          onClick={() => setActiveTab("pending")}
        >
          <Clock size={18} /> Pending
        </button>
        <button
          className={activeTab === "submitted" ? "active" : ""}
          onClick={() => setActiveTab("submitted")}
        >
          <Send size={18} /> Submitted
        </button>
        <button
          className={activeTab === "dashboard" ? "active" : ""}
          onClick={() => setActiveTab("dashboard")}
        >
          <LayoutDashboard size={18} /> Dashboard
        </button>
      </div>

      {/* ✅ Main Panel */}
      <div className="approval-content">
        <h2>Head Approval Panel</h2>

        {/* Add / Edit Form */}
        {activeTab === "add" && (
          <div className="event-form">
            <h3>{isEditing ? "Edit Event" : "Add New Event"}</h3>
            <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input
              placeholder="Event Name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
            <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
              {eventTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            <input type="file" onChange={(e) => setImage(e.target.files[0])} />
            <button onClick={handleSaveEvent}>
              {isEditing ? <><Edit size={16} /> Save Changes</> : <><PlusCircle size={16} /> Submit Event</>}
            </button>
          </div>
        )}

        {/* Pending Events */}
        {activeTab === "pending" && (
          <div className="events-list">
            {pendingEvents.length === 0 ? (
              <p>No pending events.</p>
            ) : (
              pendingEvents.map((event) => (
                <div key={event.id} className="event-card">
                  <h3>{event.title}</h3>
                  <p><strong>Name:</strong> {event.eventName}</p>
                  <p><strong>Location:</strong> {event.location}</p>
                  <p><strong>Date:</strong> {event.date} — {event.time}</p>
                  <p>{event.description}</p>
                  {event.imageURL && <img src={event.imageURL} alt={event.title} />}
                  <div className="event-actions">
                    <button className="approve-btn" onClick={() => handleApprove(event.id)}>
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button className="reject-btn" onClick={() => handleReject(event.id)}>
                      <XCircle size={14} /> Reject
                    </button>
                    <button onClick={() => addToDashboard(event)}>➕ Add to Dashboard</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Submitted */}
        {activeTab === "submitted" && (
          <div className="events-list">
            {submittedEvents.length === 0 ? (
              <p>No submitted events.</p>
            ) : (
              submittedEvents.map((event) => (
                <div key={event.id} className="event-card">
                  <h4>{event.title}</h4>
                  <p>{event.eventName}</p>
                  <p>{event.location}</p>
                  <p>{event.description}</p>
                  {event.imageURL && <img src={event.imageURL} alt={event.title} />}
                  <p>Status: {event.status}</p>
                  <button onClick={() => editEvent(event)}><Edit size={14} /> Edit</button>
                  <button onClick={() => addToDashboard(event)}>➕ Add</button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div className="events-list">
            {dashboardEvents.length === 0 ? (
              <p>Your dashboard is empty.</p>
            ) : (
              dashboardEvents.map((event) => (
                <div key={event.id} className="event-card">
                  <h4>{event.title}</h4>
                  <p>{event.eventName}</p>
                  <p>{event.location}</p>
                  <p>{event.description}</p>
                  {event.imageURL && <img src={event.imageURL} alt={event.title} />}
                  <button className="reject-btn" onClick={() => removeFromDashboard(event.id)}>
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default HeadApprovalPanel;