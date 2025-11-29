"use client";
import { useEffect, useState } from "react";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");

  // new note
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  // edit note
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  // delete confirm
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("notes_token")
      : null;

  const API = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3001";

  async function load() {
    if (!token) return;

    const res = await fetch(API + "/notes", {
      headers: { Authorization: "Bearer " + token },
    });

    if (res.ok) {
      const list = await res.json();
      setNotes(list);
    } else {
      alert("Session expired. Login again.");
      localStorage.removeItem("notes_token");
      window.location.href = "/login";
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addNote() {
    if (!newTitle.trim()) return alert("Title required");

    await fetch(API + "/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        title: newTitle,
        content: newContent
      }),
    });

    setNewTitle("");
    setNewContent("");
    load();
  }

  function startEdit(note) {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id) {
    await fetch(API + "/notes/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        title: editTitle,
        content: editContent
      }),
    });

    setEditingId(null);
    load();
  }

  function confirmDelete(id) {
    setDeleteId(id);
    setShowConfirm(true);
  }

  async function performDelete() {
    await fetch(API + "/notes/" + deleteId, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    });
    setShowConfirm(false);
    setDeleteId(null);
    load();
  }

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      (n.content || "").toLowerCase().includes(search.toLowerCase())
  );

  function logout() {
    localStorage.removeItem("notes_token");
    window.location.href = "/login";
  }

  return (
    <div
      style={{
        background: "#e5f7f5",
        minHeight: "100vh",
        padding: 20,
        color: "black",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <h1>Notes</h1>

        <button className="button" onClick={logout}>
          Logout
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search notes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: 12,
          borderRadius: 8,
          border: "1px solid #ccc",
          width: "100%",
          maxWidth: 500,
          marginBottom: 20,
        }}
      />

      {/* Add Note */}
      <div
        style={{
          background: "white",
          padding: 16,
          borderRadius: 10,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          border: "1px solid rgba(0,0,0,0.1)",
          marginBottom: 20,
          maxWidth: 600,
        }}
      >
        <input
          placeholder="Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          style={{
            width: "100%",
            border: "none",
            borderBottom: "1px solid #aaa",
            padding: 8,
            marginBottom: 10,
            outline: "none",
            background: "transparent",
          }}
        />

        <textarea
          placeholder="Content"
          rows={3}
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            resize: "none",
            padding: 8,
            background: "transparent",
          }}
        />

        <button className="button" onClick={addNote} style={{ marginTop: 12 }}>
          Add Note
        </button>
      </div>

      {/* Notes Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 20,
        }}
      >
        {filteredNotes.map((n) => (
          <div
            key={n.id}
            style={{
              background: "white",
              padding: 16,
              borderRadius: 10,
              boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
              transition: "0.2s",
              color: "black",
            }}
          >
            {editingId === n.id ? (
              <>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 6,
                    border: "none",
                    borderBottom: "1px solid #aaa",
                    marginBottom: 8,
                    outline: "none",
                    background: "transparent",
                  }}
                />

                <textarea
                  rows={4}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 6,
                    border: "none",
                    resize: "none",
                    outline: "none",
                    background: "transparent",
                  }}
                />

                <button
                  className="button"
                  onClick={() => saveEdit(n.id)}
                  style={{ marginTop: 10 }}
                >
                  Save
                </button>

                <button
                  className="button"
                  onClick={cancelEdit}
                  style={{ marginTop: 10, marginLeft: 8, background: "#aaa" }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <h3>{n.title}</h3>
                <p>{n.content}</p>

                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                  <button className="button" onClick={() => startEdit(n)}>
                    Edit
                  </button>
                  <button
                    className="button"
                    style={{ background: "#d9534f" }}
                    onClick={() => confirmDelete(n.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Delete Confirmation */}
      {showConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 20,
              borderRadius: 10,
              width: 300,
              textAlign: "center",
            }}
          >
            <h3 style={{ marginBottom: 10, textAlign: "center" }}>
              Delete Note?
            </h3>
            <p style={{ textAlign: "center" }}>
              This action cannot be undone.
            </p>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 20,
                justifyContent: "center",
              }}
            >
              <button className="button" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button
                className="button"
                style={{ background: "#d9534f" }}
                onClick={performDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}