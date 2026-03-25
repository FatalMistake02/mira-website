# Supabase Setup Guide for Mira Themes Marketplace

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project name: `mira-themes`
5. Set database password (save this somewhere safe)
6. Choose region closest to your users
7. Click "Create new project"

## 2. Get Your API Keys

Once the project is created:

1. Go to Project Settings → API
2. Copy these values:
   - **Project URL**: `https://your-project.supabase.co`
   - **anon public** key (starts with `eyJhbGciOiJIUzI1NiIs...`)
   - **service_role** key (keep this secret!)

## 3. Run the SQL Migration

1. In Supabase Dashboard, go to SQL Editor
2. Click "New query"
3. Open `supabase/migrations/001_initial.sql` from this repo
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click "Run"

This creates:
- `profiles` table (extends auth.users)
- `themes` table
- `tags` table
- `theme_tags` junction table
- `versions` table
- Row Level Security (RLS) policies
- Default tags

## 4. Configure OAuth Providers

### GitHub OAuth:

1. Go to GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. Application name: `Mira Themes`
3. Homepage URL: `http://localhost:3000` (for dev) or your production URL
4. Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
5. Click "Register application"
6. Copy Client ID and generate a new Client Secret

In Supabase Dashboard:
1. Go to Authentication → Providers
2. Enable GitHub
3. Paste Client ID and Client Secret
4. Save

### Google OAuth (optional):

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Go to APIs & Services → Credentials
4. Click "Create Credentials" → OAuth client ID
5. Application type: Web application
6. Name: `Mira Themes`
7. Authorized redirect URIs: `https://your-project.supabase.co/auth/v1/callback`
8. Click "Create"
9. Copy Client ID and Client Secret

In Supabase Dashboard:
1. Go to Authentication → Providers
2. Enable Google
3. Paste Client ID and Client Secret
4. Save

## 5. Set Up Storage Buckets

1. Go to Storage in Supabase Dashboard
2. Create two new public buckets:
   - `theme-previews` (for theme preview images)
   - `avatars` (for user avatars)
3. For each bucket, go to Policies and add:
   - SELECT policy: `true` (public read)
   - INSERT policy: `auth.uid() IS NOT NULL OR true` (allow anonymous uploads)

## 6. Configure Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Replace the values with your actual Supabase credentials.

## 7. Update Auth Callback URL

In Supabase Dashboard:
1. Go to Authentication → URL Configuration
2. Set Site URL to: `http://localhost:3000` (or your production domain)
3. Add Redirect URL: `/auth/callback`

## 8. Start Your App

```bash
npm run dev
```

Visit `http://localhost:3000/themes` to see the marketplace!

## Testing the Setup

1. Visit `/themes` - should show empty marketplace
2. Click "Sign in" → choose GitHub/Google
3. After sign-in, you should see your avatar in the header
4. Upload a theme at `/themes/upload`
5. View your profile at `/profile/[your-username]`

## Production Deployment

1. Update Site URL in Supabase to your production domain
2. Update OAuth callback URLs to production
3. Add production domain to `NEXT_PUBLIC_SITE_URL` in environment variables
4. Deploy your Next.js app

## Troubleshooting

- **"Failed to fetch" errors**: Check that your Supabase URL and anon key are correct
- **Auth not working**: Verify OAuth callback URLs match exactly
- **Uploads failing**: Check storage bucket policies and RLS policies
- **Database errors**: Run the SQL migration again and check for errors
