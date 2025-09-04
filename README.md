# Hamkari

پروژه Nuxt 4 با API های authentication و Prisma database.

## ویژگی‌ها

- ✅ Nuxt 4 + TypeScript
- ✅ Prisma ORM با PostgreSQL
- ✅ JWT Authentication
- ✅ API endpoints برای login و user info
- ✅ Seed data برای testing
- ✅ Production-ready security features
- ✅ Rate limiting و CSRF protection
- ✅ RBAC (Role-Based Access Control)

## نصب و راه‌اندازی

```bash
# نصب dependencies
npm install

# تنظیم database
npx prisma generate
npx prisma db push

# اجرای seed data
npm run seed

# اجرای سرور development
npm run dev
```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/login` - ورود کاربر
- `GET /api/auth/me` - اطلاعات کاربر (نیاز به token)

## Seed Data

- **Admin**: `09000000000` / `admin123`
- **Vendor**: `09120000001` / `vendor123`
- **Mechanic**: `09120000002` / `mechanic123`

## Production Deployment

### پیش‌نیازها
- Node.js 18+ 
- PostgreSQL 12+
- Redis (اختیاری، برای rate limiting)

### تنظیمات Environment
```bash
# کپی کردن فایل نمونه
cp production.config.ts .env

# تنظیم متغیرهای محیطی
NODE_ENV=production
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secure-secret"
```

### Security Features
- **CSRF Protection**: فعال در تمام POST/PUT/DELETE requests
- **Rate Limiting**: محدودیت درخواست‌ها بر اساس IP و کاربر
- **JWT Authentication**: با refresh token support
- **RBAC**: کنترل دسترسی بر اساس نقش کاربر
- **Security Headers**: CSP, HSTS, X-Frame-Options

### Monitoring
- لاگ‌های بدون PII
- Error tracking
- Performance monitoring

## ساختار پروژه

```
├── server/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.post.ts
│   │   │   └── me.get.ts
│   │   └── health.get.ts
│   ├── middleware/
│   │   ├── auth-cookie.ts
│   │   ├── rate-limit.ts
│   │   └── csrf.ts
│   └── utils/
│       ├── db.ts
│       ├── auth.ts
│       └── tokens.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── production.config.ts
└── nuxt.config.ts
```
