# Grievance & Support Ticketing System for Public Transport

Full-stack DBMS project for **Database Systems Engineering and Distributed Backend Development (25CS1302E)**.

The project follows the submitted project flow:
Passenger submits complaint → system creates unique ticket → admin categorizes/prioritizes/assigns → staff updates status → passenger tracks → issue resolved.

## Tech stack

- Frontend: React + Vite
- Backend: Node.js + Express
- MySQL: users, tickets, assignments and core ticket data
- MongoDB: ticket update/status history
- Authentication: JWT + bcrypt
- API testing: Postman
- Version control: Git/GitHub

The project uses **both MySQL and MongoDB**:
- MySQL is the primary relational database.
- MongoDB stores the timeline/history of every ticket update.

## Features

### Passenger
- Register/login
- Create complaint
- Select category
- Set High / Medium / Low priority
- Get an automatically generated ticket ID
- View all own complaints
- Track current status
- See how long the ticket has been open
- Read staff/admin updates

### Staff
- Login
- View assigned/all tickets
- Update ticket status
- Add progress/update messages
- See ticket details and passenger complaint

### Admin
- Login
- View all tickets
- Change priority
- Assign tickets to staff
- Update status
- Add updates
- View all users/tickets

## Prerequisites

Install:
1. Node.js 18+
2. MySQL 8+
3. MongoDB Community Server
4. VS Code

Make sure both MySQL and MongoDB services are running.

## 1. Create MySQL database

Open MySQL Workbench and run:

```sql
CREATE DATABASE grievance_db;
```

Then run the contents of:

`backend/sql/schema.sql`

This creates the required tables.

## 2. Configure backend

Open:

`backend/.env`

Use your own local database credentials.

Example:

```env
PORT=5000
JWT_SECRET=change_this_secret

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=grievance_db

MONGO_URI=mongodb://127.0.0.1:27017/grievance_history
```

## 3. Install backend

In VS Code terminal:

```powershell
cd backend
npm install
npm run dev
```

You should see:

`Server running on http://localhost:5000`

## 4. Install frontend

Open a SECOND terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally:

`http://localhost:5173`

## Demo accounts

For a clean submission, register accounts yourself from the Register screen.

To create staff/admin accounts for the expo, use the backend endpoint:

`POST /api/auth/register`

with JSON:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "Admin@123",
  "role": "admin"
}
```

Staff:

```json
{
  "name": "Staff User",
  "email": "staff@example.com",
  "password": "Staff@123",
  "role": "staff"
}
```

Passenger:

```json
{
  "name": "Passenger User",
  "email": "passenger@example.com",
  "password": "Pass@123",
  "role": "passenger"
}
```

The normal UI registration creates passenger accounts. Admin/staff accounts can be created through Postman for your presentation.

## Expo demonstration flow

1. Register/login as Passenger.
2. Create a complaint such as a bus delay.
3. Select category and priority.
4. Copy the generated ticket ID.
5. Logout.
6. Login as Admin.
7. Open the ticket.
8. Change priority / assign staff / add update.
9. Logout.
10. Login as Staff.
11. Update status to In Progress and add a message.
12. Logout.
13. Login as Passenger.
14. Open the ticket and show the timeline, current status and elapsed time.

## API summary

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Tickets
- `POST /api/tickets`
- `GET /api/tickets`
- `GET /api/tickets/:id`
- `PATCH /api/tickets/:id`
- `POST /api/tickets/:id/updates`

### Admin
- `PATCH /api/tickets/:id/assign`

## Database design

### MySQL
- `users`
- `tickets`

### MongoDB
- `ticket_updates`

MongoDB documents contain:
- ticket ID
- author
- role
- message
- old status
- new status
- timestamp

## Notes

Do not put real passwords into GitHub. The included `.env` is for local use only. `.gitignore` prevents it from being committed.

Project title and workflow are based on the submitted project materials. The submitted materials list MySQL / MongoDB, VS Code, Postman, Git/GitHub and a web-based application. 
