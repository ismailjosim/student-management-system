# Phase 10.1 Quick Reference Guide

## 🎯 What's Implemented

### ✅ Complete Authentication System

- User model with bcrypt password hashing
- NextAuth.js v5 with JWT tokens
- Login/Logout pages
- Role-based middleware (admin/coordinator/viewer)
- Navbar with user info and logout button
- Seed API for demo users

---

## 🚀 Quick Start

### 1. Start Dev Server

```bash
npm run dev
# Server runs on http://localhost:3000
```

### 2. Seed Demo Users

```bash
curl -X POST http://localhost:3000/api/seed \
  -H "x-seed-secret: dev-seed-secret-key" \
  -H "Content-Type: application/json"
```

### 3. Login

Navigate to: `http://localhost:3000/auth/login`

Use any of these credentials:

- **Admin**: <admin@example.com> / password123
- **Coordinator**: <coordinator@example.com> / password123
- **Viewer**: <viewer@example.com> / password123

### 4. Test Protected Routes

- `/dashboard` - Only accessible if logged in
- `/students` - Only accessible if logged in
- `/admin` - Only admin can access (if exists)

### 5. Logout

Click logout button in top-right navbar

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/models/User.ts` | User schema + password methods |
| `src/auth.ts` | NextAuth handlers |
| `src/auth.config.ts` | NextAuth configuration |
| `src/middleware.ts` | Route protection |
| `src/app/auth/login/page.tsx` | Login UI |
| `src/components/Layout/Navbar.tsx` | Updated navbar |
| `src/app/api/seed/route.ts` | Seed demo users |
| `.env.local` | Environment variables |

---

## 🔐 Security Features

✅ Bcrypt password hashing (10 rounds)
✅ JWT tokens with signing
✅ Secure HTTP-only cookies
✅ CSRF protection (NextAuth built-in)
✅ Route protection middleware
✅ Admin-only route enforcement
✅ Email uniqueness validation
✅ Account status checking

---

## 🧪 Test Scenarios

### Scenario 1: Normal Login

1. Visit `/auth/login`
2. Enter: <admin@example.com> / password123
3. Click "Sign In"
4. **Expected**: Redirect to dashboard, see "Admin User" in navbar

### Scenario 2: Wrong Password

1. Visit `/auth/login`
2. Enter: <admin@example.com> / wrongpassword
3. Click "Sign In"
4. **Expected**: Error toast "Invalid email or password"

### Scenario 3: Non-existent Email

1. Visit `/auth/login`
2. Enter: <nonexistent@example.com> / password123
3. Click "Sign In"
4. **Expected**: Error toast "Invalid email or password"

### Scenario 4: Logout

1. Login successfully
2. Click logout button (top-right)
3. **Expected**: Redirect to login page

### Scenario 5: Access Protected Route Without Login

1. Open browser dev tools
2. Clear all cookies
3. Navigate directly to `/dashboard`
4. **Expected**: Redirect to `/auth/login`

### Scenario 6: Role-Based Access (if admin routes exist)

1. Login as coordinator
2. Try to access `/admin` (if it exists)
3. **Expected**: See "You do not have permission" error

---

## 🐛 Troubleshooting

### Issue: "Seed API seems to timeout"

**Solution**: Check if MongoDB is running

```bash
# Check MongoDB connection
npm run db:seed  # This should work if DB is connected
```

### Issue: "Login page not loading"

**Solution**: Verify `NEXTAUTH_SECRET` in `.env.local`

```bash
# Make sure .env.local has:
NEXTAUTH_SECRET=your-secret-key
```

### Issue: "Session not persisting"

**Solution**: Check browser cookies

1. Open DevTools → Application → Cookies
2. Look for `next-auth.session-token`
3. Should have HttpOnly flag set

### Issue: "Role not showing in navbar"

**Solution**: Verify session is loaded

1. Check browser console for errors
2. Verify user role in database
3. Clear cookies and re-login

---

## 📊 Demo Users

| Email | Password | Role | Access |
|-------|----------|------|--------|
| <admin@example.com> | password123 | admin | All routes + /admin |
| <coordinator@example.com> | password123 | coordinator | Dashboard, Students, Bulk Update |
| <viewer@example.com> | password123 | viewer | Read-only access |

---

## 🔄 How It Works

```
User visits app
    ↓
Middleware checks auth token
    ↓
If no token: Redirect to login
If token exists: Allow access
    ↓
User logs in with email/password
    ↓
NextAuth validates credentials against MongoDB
    ↓
Creates JWT token in secure cookie
    ↓
User redirected to dashboard
    ↓
Navbar shows user info from session
    ↓
User can access protected routes
    ↓
User clicks logout
    ↓
JWT token cleared from cookie
    ↓
User redirected to login
```

---

## 📝 Environment Variables

```env
# Database
MONGODB_URI="mongodb://localhost:27017"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-in-production"

# Session
SESSION_MAX_AGE=86400  # 24 hours

# Seeding
SEED_SECRET="dev-seed-secret-key"
```

---

## 🎓 Learning Resources

### NextAuth.js v5 Documentation

- <https://next-auth.js.org/>

### JWT Tokens

- <https://jwt.io/>

### Bcrypt Password Hashing

- <https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html>

### Mongoose Authentication

- <https://mongoosejs.com/docs/tutorials.html>

---

## ✅ Verification Checklist

After setting up:

- [ ] Dev server running on port 3000
- [ ] Users seeded successfully
- [ ] Can login with demo credentials
- [ ] Navbar shows user name and role
- [ ] Can logout successfully
- [ ] Protected routes redirect to login when not authenticated
- [ ] TypeScript compilation passing (npm run type-check)

---

## 🚀 Next Steps

After Phase 10.1, continue with:

- **Phase 10.2**: Advanced Filtering & Search
- **Phase 10.3**: Reporting & Analytics
- **Phase 10.11**: Performance Optimization
- **Phase 10.20**: Deploy to Vercel

See `PHASE_10_1_AUTH_IMPLEMENTATION.md` for detailed documentation.
