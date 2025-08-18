# Hamkari

پروژه Nuxt 4 با API های authentication و Prisma database.

## ویژگی‌ها

- ✅ Nuxt 4 + TypeScript
- ✅ Prisma ORM با PostgreSQL
- ✅ JWT Authentication
- ✅ API endpoints برای login و user info
- ✅ Seed data برای testing

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

## ساختار پروژه

```
├── server/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.post.ts
│   │   │   └── me.get.ts
│   │   └── health.get.ts
│   └── utils/
│       ├── db.ts
│       └── jwt.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── nuxt.config.ts
```
