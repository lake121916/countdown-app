import React, { useState, useEffect, useCallback } from "react";
import { db } from "../firebase";
import "./WorkerDashboard.css";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import Navbar from "./Navbar";
import { useAuth } from "./AuthContext";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";

function WorkerDashboard() {
  const { currentUser } = useAuth();

  const [title, setTitle] = useState("");
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventType, setEventType] = useState("expo");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [image, setImage] = useState(null);

  const [submittedEvents, setSubmittedEvents] = useState([]);
  const [dashboardEvents, setDashboardEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

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

  const resetForm = () => {
    setTitle("");
    setEventName("");
    setDescription("");
    setLocation("");
    setEventType("expo");
    setDate("");
    setTime("");
    setImage(null);
    setSelectedEvent(null);
  };

  const loadSubmittedEvents = useCallback(async () => {
    if (!currentUser) return;
    try {
      const q = query(
        collection(db, "events"),
        where("proposedById", "==", currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSubmittedEvents(list);
    } catch (err) {
      console.error("Error loading submitted events:", err);
    }
  }, [currentUser]);

  const loadDashboardEvents = useCallback(async () => {
    if (!currentUser) return;
    try {
      const snapshot = await getDocs(
        collection(db, "users", currentUser.uid, "dashboard")
      );
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setDashboardEvents(list);
    } catch (err) {
      console.error("Error loading dashboard events:", err);
    }
  }, [currentUser]);

  useEffect(() => {
    loadSubmittedEvents();
    loadDashboardEvents();
  }, [loadSubmittedEvents, loadDashboardEvents]);

  const saveEvent = async () => {
    if (!title || !eventName || !date || !time || !description || !location) {
      return alert("Please fill in all fields.");
    }

    const eventDateTime = new Date(`${date}T${time}`);
    if (eventDateTime < new Date()) {
      return alert("Event must be in the future.");
    }

    try {
      let imageURL = "";
      if (image) {
        imageURL = await uploadToCloudinary(image);
      }

      const eventData = {
        title,
        eventName,
        description,
        location,
        eventType,
        date,
        time,
        fullDate: eventDateTime.toISOString(),
        imageURL,
        proposedBy: currentUser.email,
        proposedById: currentUser.uid,
        status: "pending_head",
        createdAt: serverTimestamp(),
      };

      if (selectedEvent) {
        await updateDoc(doc(db, "events", selectedEvent.id), eventData);
      } else {
        await addDoc(collection(db, "events"), eventData);
      }

      resetForm();
      loadSubmittedEvents();
      setActiveTab("submitted");
    } catch (err) {
      console.error("Error saving event:", err);
      alert("Error saving event: " + err.message);
    }
  };

  const deleteSubmittedEvent = async (id) => {
    if (window.confirm("Delete this submitted event?")) {
      try {
        await deleteDoc(doc(db, "events", id));
        loadSubmittedEvents();
      } catch (err) {
        console.error(err);
        alert("Failed to delete: " + err.message);
      }
    }
  };

  const removeFromDashboard = async (eventId) => {
    try {
      await deleteDoc(doc(db, "users", currentUser.uid, "dashboard", eventId));
      loadDashboardEvents();
      alert("Removed from your dashboard!");
    } catch (err) {
      console.error(err);
      alert("Failed to remove: " + err.message);
    }
  };

  const selectEvent = (event) => {
    setSelectedEvent(event);
    setTitle(event.title);
    setEventName(event.eventName);
    setDescription(event.description);
    setLocation(event.location);
    setEventType(event.eventType);
    setDate(event.date);
    setTime(event.time);
    setActiveTab("add");
  };

  return (
    <div className="approval-page">
      <Navbar />

      {/* ================= LEFT SIDEBAR ================= */}
      <div className="tabs">
        <button
          className={activeTab === "add" ? "active" : ""}
          onClick={() => {
            resetForm();
            setActiveTab("add");
          }}
        >
          ➕ Add Event
        </button>

        <button
          className={activeTab === "submitted" ? "active" : ""}
          onClick={() => setActiveTab("submitted")}
        >
          📤 Submitted
        </button>

        <button
          className={activeTab === "dashboard" ? "active" : ""}
          onClick={() => setActiveTab("dashboard")}
        >
          📊 Dashboard
        </button>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="approval-content">
        {activeTab === "dashboard" && (
          <div>
            <h2>My Dashboard</h2>
            {dashboardEvents.length === 0 ? (
              <p>No events added to your dashboard.</p>
            ) : (
              dashboardEvents.map((event) => (
                <div key={event.id} className="event-card">
                  <h4>{event.title}</h4>
                  <p>{event.eventName}</p>
                  <p>{event.location}</p>
                  <p>{event.description}</p>
                  {event.imageURL && <img src={event.imageURL} alt="event" />}
                  <button
                    className="reject-btn"
                    onClick={() => removeFromDashboard(event.id)}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "submitted" && (
          <div>
            <h2>Submitted Events</h2>
            {submittedEvents.length === 0 ? (
              <p>No events submitted yet.</p>
            ) : (
              submittedEvents.map((event) => (
                <div key={event.id} className="event-card">
                  <h4>{event.title}</h4>
                  <p>{event.eventName}</p>
                  <p>Status: {event.status}</p>
                  {event.imageURL && <img src={event.imageURL} alt="event" />}
                  <div className="event-actions">
                    <button onClick={() => selectEvent(event)}>Edit</button>
                    <button
                      className="reject-btn"
                      onClick={() => deleteSubmittedEvent(event.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "add" && (
          <div>
            <h2>{selectedEvent ? "Edit Event" : "Add New Event"}</h2>
            <form className="event-form">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
              />
              <input
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Event Name"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
              />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
              />
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                {eventTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
              />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
              <input type="file" onChange={(e) => setImage(e.target.files[0])} />

              <button type="button" onClick={saveEvent}>
                {selectedEvent ? "Update" : "Add"}
              </button>
              <button
                type="button"
                className="reject-btn"
                onClick={() => {
                  resetForm();
                  setActiveTab("submitted");
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkerDashboard;