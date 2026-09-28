import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import mysql from "mysql2/promise";
import crypto from "crypto";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const users = [
  { id: "u-passenger", name: "Demo Passenger", email: "passenger@demo.com", password: "passenger123", role: "passenger" },
  { id: "u-admin", name: "Transport Admin", email: "admin@demo.com", password: "admin123", role: "admin" },
  { id: "u-staff", name: "Support Staff", email: "staff@demo.com", password: "staff123", role: "staff" }
];

const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, unique: true, index: true },
  passengerId: String,
  passengerName: String,
  passengerEmail: String,
  subject: String,
  description: String,
  category: String,
  priority: { type: String, default: "Medium" },
  status: { type: String, default: "Open" },
  busNumber: String,
  route: String,
  location: String,
  assignedTo: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  history: [{
    status: String,
    note: String,
    by: String,
    at: { type: Date, default: Date.now }
  }]
});

const Ticket = mongoose.model("Ticket", ticketSchema);

let mongoReady = false;
let mysqlPool = null;

async function connectDatabases() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/public_transport_grievance");
    mongoReady = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.log("MongoDB unavailable:", err.message);
  }

  try {
    mysqlPool = mysql.createPool({
      host: process.env.MYSQL_HOST || "127.0.0.1",
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "",
      database: process.env.MYSQL_DATABASE || "public_transport_grievance",
      waitForConnections: true,
      connectionLimit: 5
    });
    await mysqlPool.query("SELECT 1");
    console.log("MySQL connected");
  } catch (err) {
    mysqlPool = null;
    console.log("MySQL unavailable:", err.message);
  }

  if (mongoReady) {
    await seedDemoTickets();
  }
}

async function seedDemoTickets() {
  const count = await Ticket.countDocuments();
  if (count > 0) return;

  const demo = [
    {
      ticketId: "PT-2026-1001",
      passengerId: "u-passenger",
      passengerName: "Demo Passenger",
      passengerEmail: "passenger@demo.com",
      subject: "Bus delay on route 218",
      description: "The bus was delayed and passengers were waiting for a long time.",
      category: "Delay",
      priority: "High",
      status: "In Progress",
      busNumber: "218A",
      route: "Miyapur - Secunderabad",
      location: "Miyapur",
      assignedTo: "Support Staff",
      history: [
        { status: "Open", note: "Ticket created", by: "Demo Passenger" },
        { status: "In Progress", note: "Assigned to support staff", by: "Transport Admin" }
      ]
    },
    {
      ticketId: "PT-2026-1002",
      passengerId: "u-passenger",
      passengerName: "Demo Passenger",
      passengerEmail: "passenger@demo.com",
      subject: "Cleanliness issue",
      description: "Seats and floor require cleaning.",
      category: "Cleanliness",
      priority: "Medium",
      status: "Resolved",
      busNumber: "45K",
      route: "Koti - Kukatpally",
      location: "Koti",
      assignedTo: "Support Staff",
      history: [
        { status: "Open", note: "Ticket created", by: "Demo Passenger" },
        { status: "Resolved", note: "Cleaning team notified and issue resolved", by: "Support Staff" }
      ]
    }
  ];
  await Ticket.insertMany(demo);
}

function ticketPayload(t) {
  return [
    t.ticketId, t.passengerName, t.passengerEmail, t.subject, t.description,
    t.category, t.priority, t.status, t.busNumber, t.route, t.location,
    t.assignedTo, new Date(t.createdAt), new Date(t.updatedAt)
  ];
}

async function mirrorTicket(t) {
  if (!mysqlPool) return;
  try {
    await mysqlPool.execute(
      `INSERT INTO tickets
      (ticket_id, passenger_name, passenger_email, subject, description, category, priority, status, bus_number, route, location, assigned_to, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      passenger_name=VALUES(passenger_name), passenger_email=VALUES(passenger_email),
      subject=VALUES(subject), description=VALUES(description), category=VALUES(category),
      priority=VALUES(priority), status=VALUES(status), bus_number=VALUES(bus_number),
      route=VALUES(route), location=VALUES(location), assigned_to=VALUES(assigned_to),
      updated_at=VALUES(updated_at)`,
      ticketPayload(t)
    );
  } catch (err) {
    console.log("MySQL mirror skipped:", err.message);
  }
}

function authUser(email, password) {
  return users.find(u => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password);
}

app.get("/api/health", async (req, res) => {
  res.json({ ok: true, mongo: mongoReady, mysql: Boolean(mysqlPool), time: new Date() });
});

app.post("/api/auth/login", (req, res) => {
  const user = authUser(req.body.email, req.body.password);
  if (!user) return res.status(401).json({ message: "Invalid email or password" });
  const { password, ...safe } = user;
  res.json({ user: safe, token: crypto.randomBytes(16).toString("hex") });
});

app.get("/api/tickets", async (req, res) => {
  if (!mongoReady) return res.status(503).json({ message: "MongoDB is not connected. Start MongoDB first." });
  const { role, userId, status, category } = req.query;
  const filter = {};
  if (role === "passenger" && userId) filter.passengerId = userId;
  if (status && status !== "All") filter.status = status;
  if (category && category !== "All") filter.category = category;
  const tickets = await Ticket.find(filter).sort({ createdAt: -1 }).lean();
  res.json(tickets);
});

app.get("/api/tickets/:id", async (req, res) => {
  if (!mongoReady) return res.status(503).json({ message: "MongoDB is not connected" });
  const ticket = await Ticket.findOne({ ticketId: req.params.id }).lean();
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });
  res.json(ticket);
});

app.post("/api/tickets", async (req, res) => {
  if (!mongoReady) return res.status(503).json({ message: "MongoDB is not connected" });

  const b = req.body;
  if (!b.subject || !b.description || !b.category) {
    return res.status(400).json({ message: "Subject, description and category are required" });
  }

  const ticketId = `PT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const ticket = await Ticket.create({
    ticketId,
    passengerId: b.passengerId || "u-passenger",
    passengerName: b.passengerName || "Passenger",
    passengerEmail: b.passengerEmail || "",
    subject: b.subject,
    description: b.description,
    category: b.category,
    priority: b.priority || "Medium",
    busNumber: b.busNumber || "",
    route: b.route || "",
    location: b.location || "",
    history: [{ status: "Open", note: "Ticket created", by: b.passengerName || "Passenger" }]
  });

  await mirrorTicket(ticket);
  res.status(201).json(ticket);
});

app.patch("/api/tickets/:id", async (req, res) => {
  if (!mongoReady) return res.status(503).json({ message: "MongoDB is not connected" });

  const ticket = await Ticket.findOne({ ticketId: req.params.id });
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });

  const oldStatus = ticket.status;
  const nextStatus = req.body.status ?? ticket.status;
  Object.assign(ticket, {
    priority: req.body.priority ?? ticket.priority,
    status: nextStatus,
    category: req.body.category ?? ticket.category,
    assignedTo: req.body.assignedTo ?? ticket.assignedTo,
    updatedAt: new Date()
  });

  if (nextStatus !== oldStatus || req.body.note) {
    ticket.history.push({
      status: nextStatus,
      note: req.body.note || `Status changed from ${oldStatus} to ${nextStatus}`,
      by: req.body.updatedBy || "Transport Staff",
      at: new Date()
    });
  }

  await ticket.save();
  await mirrorTicket(ticket);
  res.json(ticket);
});

app.get("/api/dashboard/stats", async (req, res) => {
  if (!mongoReady) return res.status(503).json({ message: "MongoDB is not connected" });
  const [total, open, progress, resolved, urgent] = await Promise.all([
    Ticket.countDocuments(),
    Ticket.countDocuments({ status: "Open" }),
    Ticket.countDocuments({ status: "In Progress" }),
    Ticket.countDocuments({ status: "Resolved" }),
    Ticket.countDocuments({ priority: "Urgent" })
  ]);
  res.json({ total, open, progress, resolved, urgent });
});

connectDatabases().then(() => {
  app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
});
