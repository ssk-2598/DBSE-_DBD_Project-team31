import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertTriangle, BarChart3, Bell, Bus, CheckCircle2, ChevronRight,
  Clock3, FileText, Filter, HelpCircle, LayoutDashboard, LogOut,
  Menu, MessageSquare, Plus, Search, ShieldCheck, Ticket, UserRound, X
} from "lucide-react";
import "./style.css";

const API = "http://localhost:5000/api";
const categories = ["Bus", "Route", "Driver", "Ticketing", "Delay", "Cleanliness", "Safety", "Other"];
const statuses = ["All", "Open", "In Progress", "Resolved"];
const demoAccounts = {
  passenger: ["passenger@demo.com", "passenger123"],
  admin: ["admin@demo.com", "admin123"],
  staff: ["staff@demo.com", "staff123"]
};

async function api(path, options = {}) {
  const res = await fetch(API + path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

function Badge({ children, tone }) {
  return <span className={`badge ${tone || children?.toLowerCase().replaceAll(" ", "-")}`}>{children}</span>;
}

function Login({ onLogin }) {
  const [role, setRole] = useState("passenger");
  const [email, setEmail] = useState(demoAccounts.passenger[0]);
  const [password, setPassword] = useState(demoAccounts.passenger[1]);
  const [error, setError] = useState("");

  const chooseRole = (r) => {
    setRole(r); setEmail(demoAccounts[r][0]); setPassword(demoAccounts[r][1]); setError("");
  };

  const submit = async (e) => {
    e.preventDefault(); setError("");
    try { const data = await api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }); onLogin(data.user); }
    catch (err) { setError(err.message); }
  };

  return (
    <div className="login-page">
      <div className="login-brand">
        <div className="brand-mark"><Bus size={26}/></div>
        <div><b>TransitCare</b><span>Public Transport Support</span></div>
      </div>
      <div className="login-card">
        <div className="eyebrow">GRIEVANCE & SUPPORT</div>
        <h1>Welcome back</h1>
        <p className="muted">Report, track and resolve public transport issues from one place.</p>
        <div className="role-tabs">
          {["passenger","admin","staff"].map(r => <button className={role===r ? "active":""} onClick={()=>chooseRole(r)} key={r}>{r}</button>)}
        </div>
        <form onSubmit={submit}>
          <label>Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email"/></label>
          <label>Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password"/></label>
          {error && <div className="error">{error}</div>}
          <button className="primary full" type="submit">Sign in <ChevronRight size={17}/></button>
        </form>
        <div className="demo-note"><ShieldCheck size={17}/><span>Demo login is pre-filled. Switch roles above to explore each workflow.</span></div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, note }) {
  return <div className="stat-card"><div className="stat-icon"><Icon size={20}/></div><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div></div>;
}

function Sidebar({ page, setPage, user, logout, mobile, close }) {
  const passengerItems = [["dashboard","Overview",LayoutDashboard],["new","New Grievance",Plus],["tickets","My Tickets",Ticket]];
  const staffItems = [["dashboard","Overview",LayoutDashboard],["tickets","Ticket Queue",Ticket],["reports","Reports",BarChart3]];
  const items = user.role === "passenger" ? passengerItems : staffItems;
  return <aside className={`sidebar ${mobile ? "mobile-open":""}`}>
    <div className="side-top">
      <div className="brand-mark small"><Bus size={20}/></div><div><b>TransitCare</b><span>Support portal</span></div>
      {mobile && <button className="icon-btn" onClick={close}><X/></button>}
    </div>
    <div className="side-section"><small>WORKSPACE</small>{items.map(([id,label,Icon]) =>
      <button key={id} className={page===id ? "nav active":"nav"} onClick={()=>{setPage(id);close?.()}}><Icon size={18}/>{label}</button>)}</div>
    <div className="side-bottom">
      <div className="user-mini"><div className="avatar"><UserRound size={17}/></div><div><b>{user.name}</b><span>{user.role}</span></div></div>
      <button className="nav logout" onClick={logout}><LogOut size={18}/> Sign out</button>
    </div>
  </aside>;
}

function Topbar({ user, title, openMenu }) {
  return <header className="topbar"><button className="mobile-menu icon-btn" onClick={openMenu}><Menu/></button><div><h2>{title}</h2><span className="muted">Friday, September 11, 2026</span></div><div className="top-actions"><button className="icon-btn"><Bell size={19}/><i/></button><div className="avatar">{user.name[0]}</div></div></header>;
}

function TicketTable({ tickets, onSelect }) {
  return <div className="table-wrap"><table><thead><tr><th>Ticket</th><th>Issue</th><th>Category</th><th>Priority</th><th>Status</th><th>Created</th></tr></thead>
    <tbody>{tickets.map(t=><tr key={t.ticketId} onClick={()=>onSelect(t)}><td><b className="ticket-link">{t.ticketId}</b></td><td><strong>{t.subject}</strong><span>{t.busNumber || "—"} · {t.route || "Route not specified"}</span></td><td>{t.category}</td><td><Badge>{t.priority}</Badge></td><td><Badge>{t.status}</Badge></td><td>{new Date(t.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table>
    {!tickets.length && <div className="empty"><Ticket size={35}/><b>No tickets found</b><span>Try another filter or create a new grievance.</span></div>}
  </div>;
}

function Dashboard({ user, setPage, openTicket }) {
  const [stats, setStats] = useState({total:0,open:0,progress:0,resolved:0,urgent:0});
  const [tickets, setTickets] = useState([]);
  useEffect(()=>{ api("/dashboard/stats").then(setStats).catch(()=>{}); api(`/tickets?role=${user.role}&userId=${user.id}`).then(setTickets).catch(()=>{}); },[user]);
  return <div className="page">
    <div className="welcome"><div><div className="eyebrow">CONTROL CENTER</div><h1>Hello, {user.name.split(" ")[0]} 👋</h1><p className="muted">Manage transport grievances with a clear, transparent workflow.</p></div>{user.role==="passenger" && <button className="primary" onClick={()=>setPage("new")}><Plus size={18}/> New grievance</button>}</div>
    <div className="stats-grid">
      <StatCard icon={Ticket} label="Total tickets" value={stats.total} note="All recorded complaints"/>
      <StatCard icon={Clock3} label="Open" value={stats.open} note="Awaiting action"/>
      <StatCard icon={MessageSquare} label="In progress" value={stats.progress} note="Being handled"/>
      <StatCard icon={CheckCircle2} label="Resolved" value={stats.resolved} note="Issues closed"/>
    </div>
    <div className="section-head"><div><h3>{user.role==="passenger" ? "Recent tickets" : "Latest support activity"}</h3><p className="muted">Track the latest grievance activity.</p></div><button className="text-btn" onClick={()=>setPage("tickets")}>View all <ChevronRight size={16}/></button></div>
    <TicketTable tickets={tickets.slice(0,5)} onSelect={openTicket}/>
  </div>;
}

function NewTicket({ user, onCreated }) {
  const [form,setForm]=useState({subject:"",description:"",category:"Bus",priority:"Medium",busNumber:"",route:"",location:""});
  const [msg,setMsg]=useState(""); const [saving,setSaving]=useState(false);
  const set=(k,v)=>setForm({...form,[k]:v});
  const submit=async e=>{e.preventDefault();setSaving(true);setMsg("");
    try { const t=await api("/tickets",{method:"POST",body:JSON.stringify({...form,passengerId:user.id,passengerName:user.name,passengerEmail:user.email})}); setMsg(`Ticket ${t.ticketId} created successfully.`); setForm({subject:"",description:"",category:"Bus",priority:"Medium",busNumber:"",route:"",location:""}); onCreated(t); }
    catch(err){setMsg(err.message)} finally{setSaving(false)}
  };
  return <div className="page narrow"><div className="eyebrow">NEW SUPPORT TICKET</div><h1>Report a grievance</h1><p className="muted lead">Submit an issue about a bus, route, driver, ticketing or any other public transport service.</p>
    <form className="ticket-form card" onSubmit={submit}>
      <div className="form-grid"><label>Issue subject<input required value={form.subject} onChange={e=>set("subject",e.target.value)} placeholder="e.g. Bus arrived late"/></label><label>Category<select value={form.category} onChange={e=>set("category",e.target.value)}>{categories.map(x=><option key={x}>{x}</option>)}</select></label></div>
      <label>Description<textarea required rows="5" value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Explain what happened..."/></label>
      <div className="form-grid three"><label>Priority<select value={form.priority} onChange={e=>set("priority",e.target.value)}><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></select></label><label>Bus number<input value={form.busNumber} onChange={e=>set("busNumber",e.target.value)} placeholder="e.g. 218A"/></label><label>Route<input value={form.route} onChange={e=>set("route",e.target.value)} placeholder="e.g. Miyapur - Secunderabad"/></label></div>
      <label>Location<input value={form.location} onChange={e=>set("location",e.target.value)} placeholder="Where did the issue occur?"/></label>
      {msg && <div className={msg.includes("created") ? "success":"error"}>{msg}</div>}
      <div className="form-footer"><span className="muted">Your complaint will receive a unique ticket ID.</span><button disabled={saving} className="primary" type="submit">{saving?"Creating...":"Create ticket"} <ChevronRight size={17}/></button></div>
    </form>
  </div>;
}

function Tickets({ user, openTicket }) {
  const [tickets,setTickets]=useState([]); const [status,setStatus]=useState("All"); const [category,setCategory]=useState("All"); const [search,setSearch]=useState("");
  const load=()=>api(`/tickets?role=${user.role}&userId=${user.id}&status=${encodeURIComponent(status)}&category=${encodeURIComponent(category)}`).then(setTickets).catch(()=>setTickets([]));
  useEffect(load,[user,status,category]);
  const filtered=useMemo(()=>tickets.filter(t=>(t.ticketId+t.subject+t.description).toLowerCase().includes(search.toLowerCase())),[tickets,search]);
  return <div className="page"><div className="section-head"><div><div className="eyebrow">{user.role==="passenger"?"MY TICKETS":"SUPPORT QUEUE"}</div><h1>{user.role==="passenger"?"My grievances":"Ticket management"}</h1></div>{user.role==="passenger"&&<span className="info-pill"><ShieldCheck size={15}/> Transparent tracking</span>}</div>
    <div className="filters"><div className="search"><Search size={17}/><input placeholder="Search ticket or issue..." value={search} onChange={e=>setSearch(e.target.value)}/></div><select value={status} onChange={e=>setStatus(e.target.value)}>{statuses.map(x=><option key={x}>{x}</option>)}</select><select value={category} onChange={e=>setCategory(e.target.value)}><option>All</option>{categories.map(x=><option key={x}>{x}</option>)}</select><button className="secondary"><Filter size={17}/> Filters</button></div>
    <TicketTable tickets={filtered} onSelect={openTicket}/>
  </div>;
}

function TicketDetail({ ticket, user, onClose, onUpdate }) {
  const [status,setStatus]=useState(ticket.status); const [priority,setPriority]=useState(ticket.priority); const [note,setNote]=useState("");
  const save=async()=>{try{const t=await api(`/tickets/${ticket.ticketId}`,{method:"PATCH",body:JSON.stringify({status,priority,note,updatedBy:user.name})});onUpdate(t);setNote("")}catch(e){alert(e.message)}};
  const canEdit=user.role!=="passenger";
  return <div className="modal-backdrop" onClick={onClose}><div className="drawer" onClick={e=>e.stopPropagation()}><div className="drawer-head"><div><Badge>{ticket.status}</Badge><h2>{ticket.subject}</h2><span className="muted">{ticket.ticketId} · {new Date(ticket.createdAt).toLocaleString()}</span></div><button className="icon-btn" onClick={onClose}><X/></button></div>
    <div className="drawer-body"><div className="detail-grid"><div><span>Category</span><b>{ticket.category}</b></div><div><span>Priority</span><Badge>{ticket.priority}</Badge></div><div><span>Bus</span><b>{ticket.busNumber||"—"}</b></div><div><span>Route</span><b>{ticket.route||"—"}</b></div><div><span>Location</span><b>{ticket.location||"—"}</b></div><div><span>Assigned to</span><b>{ticket.assignedTo||"Unassigned"}</b></div></div>
      <div className="detail-block"><span>Description</span><p>{ticket.description}</p></div>
      <div className="timeline"><h3>Ticket timeline</h3>{(ticket.history||[]).map((h,i)=><div className="timeline-row" key={i}><div className="dot"/><div><b>{h.status}</b><p>{h.note}</p><small>{h.by} · {new Date(h.at).toLocaleString()}</small></div></div>)}</div>
      {canEdit && <div className="update-box"><h3>Update ticket</h3><div className="form-grid"><label>Status<select value={status} onChange={e=>setStatus(e.target.value)}>{statuses.slice(1).map(x=><option key={x}>{x}</option>)}</select></label><label>Priority<select value={priority} onChange={e=>setPriority(e.target.value)}>{["Low","Medium","High","Urgent"].map(x=><option key={x}>{x}</option>)}</select></label></div><label>Internal update note<textarea rows="3" value={note} onChange={e=>setNote(e.target.value)} placeholder="Add resolution/update note..."/></label><button className="primary" onClick={save}>Save update <CheckCircle2 size={17}/></button></div>}
    </div></div>;
}

function Reports() {
  const [stats,setStats]=useState({total:0,open:0,progress:0,resolved:0,urgent:0});
  useEffect(()=>{api("/dashboard/stats").then(setStats).catch(()=>{})},[]);
  const rows=[["Open",stats.open],["In Progress",stats.progress],["Resolved",stats.resolved]];
  return <div className="page"><div className="eyebrow">REPORTS & INSIGHTS</div><h1>Service overview</h1><p className="muted lead">Use ticket records to identify recurring issues and improve public transport service.</p>
    <div className="report-grid">{rows.map(([x,n])=><div className="report-card" key={x}><span>{x}</span><strong>{n}</strong><div className="bar"><i style={{width:`${stats.total?Math.round(n/stats.total*100):0}%`}}/></div><small>{stats.total?Math.round(n/stats.total*100):0}% of total tickets</small></div>)}</div>
    <div className="card insight"><BarChart3/><div><h3>Accountability snapshot</h3><p>Tickets are centrally recorded with category, priority, assignment, status and history so support staff can monitor progress and passengers can track resolution.</p></div></div>
  </div>;
}

function App() {
  const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem("transitUser"))}catch{return null}});
  const [page,setPage]=useState("dashboard"); const [ticket,setTicket]=useState(null); const [mobile,setMobile]=useState(false);
  const login=u=>{setUser(u);localStorage.setItem("transitUser",JSON.stringify(u));setPage("dashboard")};
  const logout=()=>{setUser(null);localStorage.removeItem("transitUser")};
  const title=page==="new"?"New Grievance":page==="tickets"?(user?.role==="passenger"?"My Tickets":"Ticket Queue"):page==="reports"?"Reports":"Dashboard";
  if(!user)return <Login onLogin={login}/>;
  const created=()=>setPage("tickets");
  const update=t=>setTicket(t);
  return <div className="app"><Sidebar page={page} setPage={setPage} user={user} logout={logout} mobile={mobile} close={()=>setMobile(false)}/>{mobile&&<div className="mobile-overlay" onClick={()=>setMobile(false)}/>}<main className="main"><Topbar user={user} title={title} openMenu={()=>setMobile(true)}/>
    {page==="dashboard"&&<Dashboard user={user} setPage={setPage} openTicket={setTicket}/>}
    {page==="new"&&<NewTicket user={user} onCreated={created}/>}
    {page==="tickets"&&<Tickets user={user} openTicket={setTicket}/>}
    {page==="reports"&&<Reports/>}
  </main>{ticket&&<TicketDetail ticket={ticket} user={user} onClose={()=>setTicket(null)} onUpdate={t=>setTicket(t)}/>}</div>;
}

createRoot(document.getElementById("root")).render(<App />);
