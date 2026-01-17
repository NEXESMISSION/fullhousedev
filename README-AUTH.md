# Authentication Setup

## Quick Setup

1. **Run the fix-policies.sql script in Supabase SQL Editor**
   - This will update RLS policies to require authentication for admin operations
   - Public forms remain accessible without authentication

2. **Enable Email Authentication in Supabase**
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable "Email" provider
   - Configure email settings (you can use Supabase's built-in email for development)

3. **Create your first admin account**
   - Go to `/auth/login`
   - Click "Sign up" to create an account
   - Check your email for confirmation (if email confirmation is enabled)
   - Sign in with your credentials

4. **Access Admin Dashboard**
   - Once logged in, you'll be redirected to `/admin`
   - All admin pages require authentication

## How It Works

- **Public Forms** (`/form/[slug]`): No authentication required
  - Anyone can view active forms
  - Anyone can submit forms
  
- **Admin Pages** (`/admin/*`): Authentication required
  - Dashboard, Forms Management, Submissions
  - Protected by middleware
  - Redirects to `/auth/login` if not authenticated

## Troubleshooting

### "Form Not Found" Error

If you see "Form Not Found" when accessing a form URL:

1. Check that the form status is set to "active" (not "draft" or "disabled")
2. Verify the public_url matches the URL slug
3. Check browser console for detailed error logs
4. Ensure RLS policies allow public SELECT on active forms

### Can't Access Admin Pages

1. Make sure you're logged in (check `/auth/login`)
2. Verify RLS policies allow authenticated users to manage forms
3. Run `fix-policies.sql` if policies are incorrect

### Database Errors

Run `fix-policies.sql` in Supabase SQL Editor to update all policies correctly.

