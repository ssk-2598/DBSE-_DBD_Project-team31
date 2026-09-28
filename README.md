# Grievance & Support Ticketing System for Public Transport

Full-stack college project based on Team 31's submitted project abstract and PPT.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Primary database: MongoDB
- Secondary database: MySQL (compatible with MySQL Workbench)
- API testing: Postman

## Folder structure
```text
grievance-support-ticketing-system/
├── frontend/
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       └── style.css
├── backend/
│   ├── package.json
│   ├── server.js
│   └── .env.example
├── database/
│   └── mysql.sql
├── package.json
└── README.md
```

## 1. Install
Open the project folder in VS Code.

Run:
```bash
npm install
npm run install-all
```

## 2. MongoDB
Create a MongoDB database named:
`public_transport_grievance`

Copy `backend/.env.example` to `backend/.env` and set your MongoDB URI.

Example local URI:
`mongodb://127.0.0.1:27017/public_transport_grievance`

## 3. MySQL Workbench
Open `database/mysql.sql` in MySQL Workbench and run it.

Then set:
- MYSQL_HOST
- MYSQL_PORT
- MYSQL_USER
- MYSQL_PASSWORD
- MYSQL_DATABASE

The backend stores the working ticket in MongoDB and mirrors ticket data into MySQL when MySQL is available.

## 4. Run
From the root:
```bash
npm run dev
```

Frontend:
`http://localhost:5173`

Backend:
`http://localhost:5000`

## Demo accounts
Passenger:
- Email: passenger@demo.com
- Password: passenger123

Admin:
- Email: admin@demo.com
- Password: admin123

Staff:
- Email: staff@demo.com
- Password: staff123

The demo accounts are created automatically when the backend starts.

## Main API routes
- POST `/api/auth/login`
- GET `/api/tickets`
- POST `/api/tickets`
- GET `/api/tickets/:id`
- PATCH `/api/tickets/:id`
- GET `/api/dashboard/stats`
- GET `/api/health`
