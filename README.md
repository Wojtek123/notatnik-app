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
