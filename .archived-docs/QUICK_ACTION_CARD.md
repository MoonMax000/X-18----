# ⚡ Quick Action Card

**Status:** Backend Ready → Database Setup Required

---

## 🎯 Your Next 3 Steps

### 1️⃣ Choose Database (Pick One)

**Option A: Supabase** ⭐ RECOMMENDED
```
[Connect to Supabase](#open-mcp-popover)
→ Copy connection string
→ Update backend/.env
```

**Option B: Docker**
```bash
docker run --name tyrian-postgres \
  -e POSTGRES_USER=tyrian_user \
  -e POSTGRES_PASSWORD=tyrian_password_2024 \
  -e POSTGRES_DB=tyrian_trade \
  -p 5432:5432 -d postgres:15
```

**Option C: Local PostgreSQL**
```bash
cd backend && bash setup-db.sh
```

---

### 2️⃣ Setup Database

```bash
cd backend
npm install        # if not already done
npm run db:push    # apply schema
```

Expected output:
```
✔ Prisma schema loaded
✔ Database connected
```

---

### 3️⃣ Start Backend

```bash
npm run dev
```

Expected output:
```
🚀 Backend server running on port 3001
```

**Test it:**
```bash
curl http://localhost:3001/health
```

---

## 📚 Need Help?

| Issue | Solution |
|-------|----------|
| Can't connect to DB | See [DATABASE_SETUP.md](backend/DATABASE_SETUP.md) |
| What's next? | See [СЛЕДУЮЩИЕ_ШАГИ.md](СЛЕДУЮЩИЕ_ШАГИ.md) |
| Full details | See [CONTINUE_FROM_HERE.md](CONTINUE_FROM_HERE.md) |

---

## 📊 Progress

```
✅ Backend:  85% (Ready!)
⚠️ Database: 0%  (← YOU ARE HERE)
⏳ Frontend: 75% (Waiting for DB)
```

**Time estimate:**
- Database setup: 5-30 min
- Frontend integration: 2-4 hours

---

**Start here:** [Connect to Supabase](#open-mcp-popover)
