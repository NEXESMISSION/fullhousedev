# Complete Setup Guide

## Step 1: Run Database Migration

1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Open a new query
3. Copy the **entire contents** of `supabase/migrate-safe.sql`
4. Paste and click **Run**
5. This will create all tables, types, and policies safely (can be run multiple times)

## Step 2: Enable Authentication

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email settings:
   - For development: You can use Supabase's built-in email (limited)
   - For production: Configure SMTP settings
4. (Optional) Disable "Confirm email" for faster testing in development

## Step 3: Create Your Admin Account

1. Start your Next.js app: `npm run dev`
2. Navigate to: `http://localhost:3000/auth/login`
3. Enter your email and password
4. Click **"Don't have an account? Sign up"** to create an account
5. If email confirmation is enabled, check your email and confirm
6. Sign in with your credentials

## Step 4: Test the System

### Test Admin Access:
- Go to `/admin` - Should redirect to login if not authenticated
- After login, you should see the dashboard
- Create a form, add fields, set status to "active"

### Test Public Forms:
- Copy the public URL of an active form
- Open in incognito/private window (not logged in)
- Should be able to view and submit the form

## Troubleshooting

### "Type already exists" Error
- Use `migrate-safe.sql` instead of `schema.sql`
- The safe script checks for existing types before creating them

### "Form Not Found" Error
1. Check form status is "active" (not "draft")
2. Verify the public_url matches the URL slug exactly
3. Check browser console (F12) for detailed logs
4. Ensure RLS policies allow public SELECT on active forms

### Can't Create Forms (401 Error)
1. Make sure you're logged in
2. Run `migrate-safe.sql` to ensure policies are correct
3. Check that "Authenticated users can manage forms" policy exists

### Can't View Submissions
1. Make sure you're logged in as an authenticated user
2. Verify RLS policies allow authenticated users to SELECT from submissions

## Quick Fix Scripts

- **First time setup**: Run `migrate-safe.sql`
- **Fix policies only**: Run `fix-policies.sql`
- **Complete reset**: Drop all tables and run `migrate-safe.sql` again

## Authentication Flow

```
Public User → /form/[slug] → Can view & submit (no auth needed)
Admin User → /admin/* → Must be authenticated → Redirects to /auth/login if not
```

## Security Notes

- Public forms are accessible without authentication
- Only active forms are visible to the public
- Admin operations require authentication
- RLS policies enforce these rules at the database level

