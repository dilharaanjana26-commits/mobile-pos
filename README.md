# Mobile POS (V1)

Full-stack POS for a mobile phone shop:
- Next.js App Router (UI + API)
- MongoDB Atlas + Mongoose
- JWT auth (httpOnly cookie)
- Products + IMEI units
- Transaction-safe sales (prevents double-selling IMEI / negative stock)

## Setup
1. Install deps:
```bash
npm install
```

2. Create `.env.local`:
```env
MONGODB_URI="mongodb+srv://USER:PASSWORD@cluster.mongodb.net/mobile_pos?retryWrites=true&w=majority"
JWT_SECRET="change_this_to_a_long_random_secret"
```

3. Seed first admin user (Atlas UI insert into `users` collection):
- username: admin
- name: Admin
- role: ADMIN
- isActive: true
- passwordHash: bcrypt hash of your password (e.g. "admin123")

Run:
```bash
npm run dev
```

Open:
- http://localhost:3000/login
- http://localhost:3000/pos
