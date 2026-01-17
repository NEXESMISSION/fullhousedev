# Vercel Environment Variables Setup - URGENT

## You Must Set Environment Variables in Vercel!

Your application is showing "Supabase client not initialized" errors because **environment variables are not set in Vercel**.

### Step-by-Step Instructions:

1. **Go to Vercel Dashboard:**
   - Visit https://vercel.com/dashboard
   - Find and select your project: `fullhousedev` (or your project name)

2. **Navigate to Settings:**
   - Click on **Settings** tab
   - Click on **Environment Variables** in the left sidebar

3. **Add Required Variables:**

   Add these THREE variables for **Production**, **Preview**, AND **Development**:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
   ```

   **Important:** Make sure to select all three environments (Production, Preview, Development) when adding each variable!

4. **Find Your Supabase Values:**
   - Go to your Supabase project dashboard: https://supabase.com/dashboard
   - Select your project
   - Go to **Settings** → **API**
   - Copy **Project URL** → use for `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **anon public** key → use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. **Redeploy:**
   - After adding all variables, go to **Deployments** tab
   - Click **⋮** (three dots) on the latest deployment
   - Click **Redeploy**
   - Check "Use existing Build Cache" is unchecked
   - Click **Redeploy**

### Quick Checklist:

- [ ] Added `NEXT_PUBLIC_SUPABASE_URL` (for all environments)
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY` (for all environments)
- [ ] Added `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (for all environments, if using maps)
- [ ] Redeployed the project

### After Setting Variables:

Once you set the environment variables and redeploy, the "Supabase client not initialized" error will be fixed. The application needs these variables to connect to Supabase.

### Note:

The `.env.local` file on your local machine is **NOT** automatically deployed to Vercel. You must manually add these variables in the Vercel Dashboard.

