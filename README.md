# PR Club

A personal records dashboard built with Next.js and Supabase. Exercise data is private to the signed-in account through row-level security.

## Run locally

```sh
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use the lift filters and search to browse records. The KG/LB control changes the displayed weights.

## Supabase setup

1. Copy `.env.example` to `.env.local` and add your Supabase project URL and publishable key.
2. In the Supabase dashboard, open **SQL Editor** and run the migrations in `supabase/migrations` in filename order. If the exercise table already exists, run the newest migration to remove the unused `reps` column.
3. In **Authentication → URL Configuration**, allow `http://localhost:3000` as a redirect URL for local development. Add your deployed app URL there when you deploy.
4. Start the app and sign in with your email. The first sign-in imports the existing demo lifts as starter entries.
