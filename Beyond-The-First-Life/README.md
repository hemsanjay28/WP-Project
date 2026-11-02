# Beyond The First Life — Hackathon MVP

A full-stack React + Express EV battery second-life platform with:

- Separate User and Admin portals
- JWT login/register
- One-click simulated battery diagnostic ingestion
- Good / Fair / Recycle triage
- 5-year Battery Health Decay Simulator
- High-usage vs Light-usage projection chart
- Second-life matchmaking
- Application recommendations
- Fleet API integration simulator
- Zero-Knowledge Proof (ZKP) verification simulator
- Residual value / real-time pricing index
- Marketplace
- Transactions
- Admin analytics
- Live activity feed
- Responsive dark SaaS UI

## Requirements

- Node.js 20+
- npm 10+

No MongoDB is required for the demo. The backend uses an in-memory data store so you can run the project immediately.

## Run

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend:
http://localhost:5000

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:
http://localhost:5173

## Demo accounts

User:
- Email: dealer@beyondlife.demo
- Password: demo123

Admin:
- Email: admin@beyondlife.demo
- Password: admin123

## Important

This is a hackathon MVP. Battery diagnostics, ZKP, commodity prices, fleet integrations, and marketplace settlement are simulated. For production, replace these demo services with authenticated fleet APIs, a real battery BMS/diagnostic source, a real ZK proving system, live commodity feeds, a database, and payment/escrow infrastructure.
