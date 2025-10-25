# 🗄️ Database Setup Guide

This guide will help you set up PostgreSQL for Tyrian Trade backend.

## Option 1: 🚀 Supabase (Recommended - Cloud)

**Fastest and easiest option - no local installation needed**

### Steps:

1. **Connect to Supabase via Builder.io**
   - Click [Connect to Supabase](#open-mcp-popover) in Builder.io
   - Follow the authentication flow
   - Copy your project details

2. **Update `.env` file**
   ```bash
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```

3. **Push schema to Supabase**
   ```bash
   cd backend
   npm run db:push
   ```

4. **Start backend**
   ```bash
   npm run dev
   ```

**Benefits:**
- ✅ No local installation
- ✅ Free tier available
- ✅ Automatic backups
- ✅ Built-in authentication (future integration)
- ✅ Real-time capabilities
- ✅ pgAdmin-like dashboard

---

## Option 2: 🐘 Local PostgreSQL

### macOS

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Run setup script
cd backend
chmod +x setup-db.sh
./setup-db.sh
```

### Ubuntu/Debian

```bash
# Install PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Run setup script
cd backend
chmod +x setup-db.sh
sudo ./setup-db.sh
```

### Windows

1. **Download PostgreSQL**
   - Go to https://www.postgresql.org/download/windows/
   - Download installer for PostgreSQL 15+
   - Run installer (remember the password you set for `postgres` user)

2. **Start PostgreSQL**
   - PostgreSQL should start automatically
   - Or: Open Services → PostgreSQL → Start

3. **Create Database Manually**
   ```cmd
   # Open Command Prompt as Administrator
   psql -U postgres

   # In psql:
   CREATE USER tyrian_user WITH PASSWORD 'tyrian_password_2024';
   CREATE DATABASE tyrian_trade OWNER tyrian_user;
   GRANT ALL PRIVILEGES ON DATABASE tyrian_trade TO tyrian_user;
   \c tyrian_trade
   GRANT ALL ON SCHEMA public TO tyrian_user;
   \q
   ```

4. **Update `.env`**
   ```
   DATABASE_URL="postgresql://tyrian_user:tyrian_password_2024@localhost:5432/tyrian_trade"
   ```

---

## Option 3: 🐳 Docker (Cross-platform)

```bash
# Create and start PostgreSQL container
docker run --name tyrian-postgres \
  -e POSTGRES_USER=tyrian_user \
  -e POSTGRES_PASSWORD=tyrian_password_2024 \
  -e POSTGRES_DB=tyrian_trade \
  -p 5432:5432 \
  -d postgres:15

# Verify container is running
docker ps

# Update .env
echo 'DATABASE_URL="postgresql://tyrian_user:tyrian_password_2024@localhost:5432/tyrian_trade"' >> backend/.env
```

**Docker Commands:**
```bash
# Stop database
docker stop tyrian-postgres

# Start database
docker start tyrian-postgres

# View logs
docker logs tyrian-postgres

# Remove container (WARNING: deletes data)
docker rm -f tyrian-postgres
```

---

## Verification

After setting up the database (any option):

```bash
cd backend

# 1. Push Prisma schema to database
npm run db:push

# Expected output:
# ✔ Prisma schema loaded
# ✔ Datasource "db": PostgreSQL database
# ✔ Your database is now in sync with your Prisma schema

# 2. (Optional) Open Prisma Studio to view database
npm run db:studio

# 3. Start backend server
npm run dev

# Expected output:
# [INFO] Server running on port 3001
# [INFO] Database connected
```

---

## Troubleshooting

### Error: `Can't reach database server`

**Cause:** PostgreSQL is not running

**Fix:**
- macOS: `brew services start postgresql@15`
- Ubuntu: `sudo systemctl start postgresql`
- Windows: Start PostgreSQL service
- Docker: `docker start tyrian-postgres`

### Error: `Invalid DATABASE_URL`

**Cause:** Wrong connection string format

**Fix:** Check `.env` format:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

### Error: `Authentication failed`

**Cause:** Wrong username/password

**Fix:** 
1. Recreate user with correct password
2. Update `DATABASE_URL` in `.env`

### Error: `Database does not exist`

**Cause:** Database not created

**Fix:**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE tyrian_trade;
```

---

## Database Management

### View Database (GUI)

**Prisma Studio** (Built-in):
```bash
npm run db:studio
# Opens http://localhost:5555
```

**pgAdmin** (Optional):
- Download: https://www.pgadmin.org/download/
- Add server with connection details

**Supabase Dashboard** (if using Supabase):
- Go to https://app.supabase.com
- Select your project → Table Editor

### Migrations

```bash
# Push schema changes (development)
npm run db:push

# Generate migration (production)
npx prisma migrate dev --name description_of_changes

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

---

## Next Steps

Once database is set up:

1. ✅ Database connected
2. → Push Prisma schema (`npm run db:push`)
3. → Start backend (`npm run dev`)
4. → Test API endpoints
5. → Integrate with frontend

---

## Quick Reference

| Task | Command |
|------|---------|
| Setup Supabase | [Connect to Supabase](#open-mcp-popover) |
| Setup Local | `./setup-db.sh` |
| Push schema | `npm run db:push` |
| Start server | `npm run dev` |
| View DB | `npm run db:studio` |
| Reset DB | `npx prisma migrate reset` |

---

**Recommended:** Use **Supabase** for fastest setup and best features.
