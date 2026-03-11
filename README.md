# Notatnik z Logowaniem

Aplikacja webowa w Next.js z funkcjami:

- Rejestracja i logowanie (NextAuth Credentials)
- Ochrona tras po zalogowaniu
- Notatnik po zalogowaniu (CRUD notatek)
- Wyszukiwarka notatek
- Autosave z opoznieniem
- Podglad Markdown

## Wymagania

- Node.js 20+
- Docker (opcjonalnie, do lokalnego PostgreSQL)

## Szybki start lokalny

1. Skopiuj zmienne:

```bash
cp .env.example .env
```

2. Uruchom PostgreSQL przez Docker:

```bash
docker compose up -d
```

3. Wygeneruj klienta Prisma i uruchom migracje:

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Uruchom aplikacje:

```bash
npm run dev
```

Otworz [http://localhost:3000](http://localhost:3000).

## Przydatne komendy

```bash
npm run lint
npm run build
```

## Publikacja za darmo (Vercel + Neon)

1. Utworz darmowa baze PostgreSQL w Neon i skopiuj `DATABASE_URL`.
2. Zaimportuj repo `Wojtek123/notatnik-app` do Vercel (Import Project).
3. Ustaw zmienne srodowiskowe w Vercel:

```bash
DATABASE_URL=postgresql://...
AUTH_SECRET=losowy_dlugi_sekret
AUTH_TRUST_HOST=true
NEXTAUTH_URL=https://twoj-projekt.vercel.app
```

4. Ustaw Build Command w Vercel na:

```bash
npm run prisma:generate && npm run build
```

5. Po pierwszym deployu uruchom migracje na bazie produkcyjnej:

```bash
npx prisma migrate deploy
```

6. Otworz adres z Vercel i przetestuj: rejestracja, logowanie, CRUD notatek.
