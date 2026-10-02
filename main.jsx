import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API = "http://localhost:5000/api";

const categories = [
  "Bus",
  "Route",
  "Driver",
  "Ticketing",
  "Delay",
  "Cleanliness",
  "Safety",
  "Other"
];

const priorities = ["Low", "Medium", "High"];
const statuses = ["Open", "In Progress", "On Hold", "Resolved", "Closed"];

async function request(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(API + path, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function timeAgo(date) {
  const ms = Date.now() - new Date(date).getTime();
  const mins = Math.max(0, Math.floor(ms / 60000));

  const days = Math.floor(mins / 1440);
  const hrs = Math.floor((mins % 1440) / 60);
  const m = mins % 60;

  return days
    ? `${days}d ${hrs}h`
    : hrs
    ? `${hrs}h ${m}m`
    : `${m}m`;
}

function App() {
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("user") || "null")
  );

  const [mode, setMode] = useState("login");
  const [selected, setSelected] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [flash, setFlash] = useState("");

  if (!user) {
    return (
      <Auth
        mode={mode}
        setMode={setMode}
        onLogin={(u) => setUser(u)}
        setFlash={setFlash}
        flash={flash}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      logout={() => {
        localStorage.clear();
        setUser(null);
      }}
      selected={selected}
      setSelected={setSelected}
      refresh={refresh}
      setRefresh={setRefresh}
      flash={flash}
      setFlash={setFlash}
    />
  );
}

/* =========================
   LOGIN / REGISTER
========================= */

function Auth({ mode, setMode, onLogin, flash, setFlash }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "passenger"
  });

  const [busy, setBusy] = useState(false);

  function changeMode(newMode) {
    setMode(newMode);
    setFlash("");

    setForm({
      name: "",
      email: "",
      password: "",
      role: "passenger"
    });
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setFlash("");

    try {
      const payload =
        mode === "register"
          ? form
          : {
              email: form.email,
              password: form.password
            };

      const data = await request(
        `/auth/${mode === "login" ? "login" : "register"}`,
        {
          method: "POST",
          body: JSON.stringify(payload)
        }
      );

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      onLogin(data.user);
    } catch (e) {
      setFlash(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth-background">
        <div className="glow glow-one"></div>
        <div className="glow glow-two"></div>
      </div>

      <div className="auth-card">
        <div className="brand">
          PUBLIC<span>TRANSIT</span>
        </div>

        <div className="auth-icon">
          {mode === "login" ? "↪" : "✦"}
        </div>

        <h1>
          {mode === "login"
            ? "Welcome back"
            : "Create your account"}
        </h1>

        <p className="muted">
          {mode === "login"
            ? "Track and manage your transport support tickets."
            : "Register to raise and track transport grievances."}
        </p>

        {flash && <div className="alert">{flash}</div>}

        <form onSubmit={submit}>
          {mode === "register" && (
            <>
              <label>Full name</label>

              <input
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value
                  })
                }
                required
              />

              <label>Account type</label>

              <div className="role-grid">
                <button
                  type="button"
                  className={`role-option ${
                    form.role === "passenger" ? "selected" : ""
                  }`}
                  onClick={() =>
                    setForm({
                      ...form,
                      role: "passenger"
                    })
                  }
                >
                  <span className="role-icon">👤</span>

                  <span>
                    <b>Passenger</b>
                    <small>Raise complaints</small>
                  </span>
                </button>

                <button
                  type="button"
                  className={`role-option ${
                    form.role === "staff" ? "selected" : ""
                  }`}
                  onClick={() =>
                    setForm({
                      ...form,
                      role: "staff"
                    })
                  }
                >
                  <span className="role-icon">🛠</span>

                  <span>
                    <b>Staff</b>
                    <small>Manage tickets</small>
                  </span>
                </button>

                <button
                  type="button"
                  className={`role-option ${
                    form.role === "admin" ? "selected" : ""
                  }`}
                  onClick={() =>
                    setForm({
                      ...form,
                      role: "admin"
                    })
                  }
                >
                  <span className="role-icon">⚙</span>

                  <span>
                    <b>Admin</b>
                    <small>Manage system</small>
                  </span>
                </button>
              </div>
            </>
          )}

          <label>Email address</label>

          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value
              })
            }
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value
              })
            }
            required
          />

          <button
            className="primary auth-submit"
            disabled={busy}
          >
            {busy
              ? "Please wait..."
              : mode === "login"
              ? "Login to Dashboard"
              : "Create Account"}
          </button>
        </form>

        <button
          className="link"
          onClick={() =>
            changeMode(
              mode === "login"
                ? "register"
                : "login"
            )
          }
        >
          {mode === "login"
            ? "New user? Create an account"
            : "Already registered? Login"}
        </button>
      </div>
    </div>
  );
}

/* =========================
   DASHBOARD
========================= */

function Dashboard({
  user,
  logout,
  selected,
  setSelected,
  refresh,
  setRefresh,
  flash,
  setFlash
}) {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    try {
      setTickets(await request("/tickets"));

      if (user.role === "admin") {
        setUsers(await request("/users"));
      }
    } catch (e) {
      setFlash(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [refresh, user.role]);

  const stats = {
    total: tickets.length,
    open: tickets.filter(
      (t) => t.status === "Open"
    ).length,
    progress: tickets.filter(
      (t) => t.status === "In Progress"
    ).length,
    resolved: tickets.filter((t) =>
      ["Resolved", "Closed"].includes(t.status)
    ).length
  };

  return (
    <div className="app">
      <header>
        <div>
          <div className="brand">
            PUBLIC<span>TRANSIT</span>
          </div>

          <small>
            Grievance & Support Ticketing System
          </small>
        </div>

        <div className="userbar">
          <span>
            {user.name} · <b>{user.role}</b>
          </span>

          <button onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main>
        <div className="hero">
          <div>
            <p className="eyebrow">
              TRANSPORT SUPPORT
            </p>

            <h1>
              {user.role === "passenger"
                ? "Your complaints, tracked in one place"
                : "Ticket operations dashboard"}
            </h1>

            <p className="muted">
              {user.role === "passenger"
                ? "Raise a grievance and follow every update until resolution."
                : "Review complaints, prioritize issues, assign staff and keep passengers updated."}
            </p>
          </div>

          {user.role === "passenger" && (
            <CreateTicket
              onDone={() =>
                setRefresh((x) => x + 1)
              }
            />
          )}
        </div>

        <div className="stats">
          <Stat
            label="Total tickets"
            value={stats.total}
          />

          <Stat
            label="Open"
            value={stats.open}
          />

          <Stat
            label="In progress"
            value={stats.progress}
          />

          <Stat
            label="Resolved"
            value={stats.resolved}
          />
        </div>

        {flash && (
          <div className="alert">
            {flash}
          </div>
        )}

        <section className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">
                SUPPORT CENTER
              </p>

              <h2>Tickets</h2>
            </div>

            <button
              className="outline"
              onClick={() =>
                setRefresh((x) => x + 1)
              }
            >
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <p>Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">
                ✓
              </div>

              <h3>No complaints yet</h3>

              <p>
                Create the first ticket to start
                tracking transport issues.
              </p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Complaint</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <b>{t.ticket_code}</b>
                        <small>
                          {t.category}
                        </small>
                      </td>

                      <td>
                        <b>{t.title}</b>
                        <small>
                          {t.passenger_name}
                        </small>
                      </td>

                      <td>
                        <span
                          className={`pill ${t.priority.toLowerCase()}`}
                        >
                          {t.priority}
                        </span>
                      </td>

                      <td>
                        <span className="status">
                          {t.status}
                        </span>
                      </td>

                      <td>
                        {timeAgo(
                          t.created_at
                        )}{" "}
                        ago
                      </td>

                      <td>
                        <button
                          className="outline"
                          onClick={async () =>
                            setSelected(
                              await request(
                                `/tickets/${t.id}`
                              )
                            )
                          }
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {user.role === "admin" && (
          <section className="panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">
                  SYSTEM MANAGEMENT
                </p>

                <h2>Users</h2>
              </div>
            </div>

            <div className="user-grid">
              {users.map((u) => (
                <div
                  className="user-card"
                  key={u.id}
                >
                  <div className="user-avatar">
                    {u.name
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </div>

                  <div>
                    <b>{u.name}</b>
                    <span>{u.email}</span>
                    <small>
                      {u.role}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {selected && (
        <TicketModal
          ticket={selected}
          user={user}
          users={users}
          close={() =>
            setSelected(null)
          }
          refresh={() => {
            setSelected(null);
            setRefresh((x) => x + 1);
          }}
        />
      )}
    </div>
  );
}

/* =========================
   STATS
========================= */

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

/* =========================
   CREATE TICKET
========================= */

function CreateTicket({ onDone }) {
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    category: "Bus",
    busNumber: "",
    title: "",
    description: "",
    priority: "Medium"
  });

  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();

    try {
      const t = await request("/tickets", {
        method: "POST",
        body: JSON.stringify(form)
      });

      setMsg(
        `Ticket ${t.ticket_code} created successfully.`
      );

      /* RESET FORM INCLUDING BUS NUMBER */
      setForm({
        category: "Bus",
        busNumber: "",
        title: "",
        description: "",
        priority: "Medium"
      });

      onDone();
    } catch (e) {
      setMsg(e.message);
    }
  }

  return (
    <div className="create-box">
      {!open ? (
        <button
          className="primary big"
          onClick={() =>
            setOpen(true)
          }
        >
          + Raise a complaint
        </button>
      ) : (
        <form
          className="ticket-form"
          onSubmit={submit}
        >
          <div className="form-row">
            <select
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category:
                    e.target.value
                })
              }
            >
              {categories.map((x) => (
                <option key={x}>
                  {x}
                </option>
              ))}
            </select>

            <select
              value={form.priority}
              onChange={(e) =>
                setForm({
                  ...form,
                  priority:
                    e.target.value
                })
              }
            >
              {priorities.map((x) => (
                <option key={x}>
                  {x}
                </option>
              ))}
            </select>
          </div>

          {/* BUS NUMBER */}
          <input
            placeholder="Bus number (e.g. TS08AB1234)"
            value={form.busNumber}
            onChange={(e) =>
              setForm({
                ...form,
                busNumber:
                  e.target.value
              })
            }
            required
          />

          {/* COMPLAINT TITLE */}
          <input
            placeholder="Complaint title"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title:
                  e.target.value
              })
            }
            required
          />

          {/* DESCRIPTION */}
          <textarea
            placeholder="Describe the problem..."
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description:
                  e.target.value
              })
            }
            required
          />

          {msg && (
            <div className="success">
              {msg}
            </div>
          )}

          <div className="actions">
            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
            >
              Cancel
            </button>

            <button className="primary">
              Submit complaint
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/* =========================
   TICKET MODAL
========================= */

function TicketModal({
  ticket,
  user,
  users,
  close,
  refresh
}) {
  const [status, setStatus] =
    useState(ticket.status);

  const [priority, setPriority] =
    useState(ticket.priority);

  const [staffId, setStaffId] =
    useState(
      ticket.assigned_staff_id || ""
    );

  const [message, setMessage] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  async function save() {
    setSaving(true);

    try {
      if (user.role !== "passenger") {
        await request(
          `/tickets/${ticket.id}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              status,
              priority
            })
          }
        );
      }

      if (
        user.role === "admin" &&
        staffId
      ) {
        await request(
          `/tickets/${ticket.id}/assign`,
          {
            method: "PATCH",
            body: JSON.stringify({
              staffId:
                Number(staffId)
            })
          }
        );
      }

      if (message.trim()) {
        await request(
          `/tickets/${ticket.id}/updates`,
          {
            method: "POST",
            body: JSON.stringify({
              message
            })
          }
        );
      }

      refresh();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-back">
      <div className="modal">
        <button
          className="close"
          onClick={close}
        >
          ×
        </button>

        <div className="ticket-head">
          <div>
            <p className="eyebrow">
              {ticket.ticket_code}
            </p>

            <h2>
              {ticket.title}
            </h2>

            <p className="muted">
              {ticket.category} · Bus No:{" "}
              {ticket.bus_number ||
                ticket.busNumber ||
                "Not provided"}{" "}
              · submitted by{" "}
              {ticket.passenger_name}
            </p>
          </div>

          <span
            className={`pill ${ticket.priority.toLowerCase()}`}
          >
            {ticket.priority}
          </span>
        </div>

        <div className="description">
          {ticket.description}
        </div>

        <div className="track">
          <div className="track-line"></div>

          {[
            "Open",
            "In Progress",
            "On Hold",
            "Resolved"
          ].map((s) => (
            <div
              className={`track-step ${
                ticket.status === s ||
                ([
                  "Resolved",
                  "Closed"
                ].includes(
                  ticket.status
                ) &&
                  s === "Resolved") ||
                [
                  "In Progress",
                  "On Hold",
                  "Resolved"
                ].indexOf(s) <
                  [
                    "In Progress",
                    "On Hold",
                    "Resolved"
                  ].indexOf(
                    ticket.status
                  )
                  ? "done"
                  : ""
              }`}
              key={s}
            >
              <i></i>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <p>
          <b>Open for:</b>{" "}
          {timeAgo(
            ticket.created_at
          )}
        </p>

        <h3>
          Update history
        </h3>

        <div className="timeline">
          {ticket.updates?.map(
            (u, i) => (
              <div
                className="event"
                key={i}
              >
                <div className="dot"></div>

                <div>
                  <b>
                    {u.authorName}
                  </b>

                  <small>
                    {u.authorRole} ·{" "}
                    {new Date(
                      u.createdAt
                    ).toLocaleString()}
                  </small>

                  <p>
                    {u.message}
                  </p>
                </div>
              </div>
            )
          )}
        </div>

        {user.role !== "passenger" && (
          <div className="admin-controls">
            <label>
              Status

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value
                  )
                }
              >
                {statuses.map(
                  (x) => (
                    <option key={x}>
                      {x}
                    </option>
                  )
                )}
              </select>
            </label>

            <label>
              Priority

              <select
                value={priority}
                onChange={(e) =>
                  setPriority(
                    e.target.value
                  )
                }
              >
                {priorities.map(
                  (x) => (
                    <option key={x}>
                      {x}
                    </option>
                  )
                )}
              </select>
            </label>

            {user.role === "admin" && (
              <label>
                Assign staff

                <select
                  value={staffId}
                  onChange={(e) =>
                    setStaffId(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select staff
                  </option>

                  {users
                    .filter(
                      (u) =>
                        u.role ===
                        "staff"
                    )
                    .map((u) => (
                      <option
                        value={u.id}
                        key={u.id}
                      >
                        {u.name}
                      </option>
                    ))}
                </select>
              </label>
            )}

            <label className="full">
              Add progress update

              <textarea
                value={message}
                onChange={(e) =>
                  setMessage(
                    e.target.value
                  )
                }
                placeholder="Tell the passenger what is happening..."
              />
            </label>

            <button
              className="primary"
              disabled={saving}
              onClick={save}
            >
              {saving
                ? "Saving..."
                : "Save update"}
            </button>
          </div>
        )}

        <button
          className="outline wide"
          onClick={close}
        >
          Close
        </button>
      </div>
    </div>
  );
}

createRoot(
  document.getElementById("root")
).render(<App />);