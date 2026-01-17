# Environment Variables

This document lists all required environment variables for the application.

## Required Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration (Required)
# Get these values from your Supabase project settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Google Maps API Key (Optional - only needed if using location fields)
# See GOOGLE_MAPS_SETUP.md for detailed setup instructions
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
```

## Vercel Deployment

**IMPORTANT:** When deploying to Vercel, you must manually add these environment variables in the Vercel Dashboard:

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings → Environment Variables**
3. Add each variable for **Production**, **Preview**, and **Development** environments
4. After adding variables, **REDEPLOY** your project (changes require a new deployment)

The `.env.local` file is gitignored and will NOT be automatically deployed to Vercel.

## Finding Your Values

### Supabase Variables
- Go to your Supabase project dashboard
- Navigate to **Settings → API**
- Copy the **Project URL** (for `NEXT_PUBLIC_SUPABASE_URL`)
- Copy the **anon public** key (for `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### Google Maps API Key
See `GOOGLE_MAPS_SETUP.md` for detailed instructions on obtaining a Google Maps API key.
