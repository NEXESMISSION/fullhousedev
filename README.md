# Dynamic Form Builder Platform

A comprehensive web platform that allows business owners to create multiple public forms, define custom fields, collect submissions, and manage all data from a centralized dashboard.

## Features

- **Form Management**: Create, edit, and delete forms with custom configurations
- **Field Management**: Add, edit, reorder, and configure fields (text, number, email, phone, textarea, select, checkbox, date, location)
- **Location Fields**: Google Maps integration for location selection and visualization
- **Tunisia Map View**: Visualize all submitted locations on an interactive map of Tunisia
- **Public Forms**: Dynamic form rendering accessible via unique URLs
- **Submissions Management**: View, search, filter, export, and delete submissions
- **Admin Dashboard**: Centralized control center with overview statistics

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, Row Level Security)
- **Form Handling**: React Hook Form, Zod validation
- **Export**: XLSX for Excel export

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in your Supabase dashboard
3. **Run `supabase/setup-complete.sql`** - This is the safest script that handles everything (types, tables, indexes, policies, location field support). **You can run this multiple times without errors.**
4. Go to Authentication → Providers and enable "Email" authentication

**Note:** If you get "type already exists" errors, use `setup-complete.sql` instead of `schema.sql`. The setup-complete script checks for existing types before creating them.

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

You can find Supabase values in your Supabase project settings under API.

For Google Maps API Key:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable "Maps JavaScript API" and "Geocoding API" (APIs & Services → Library)
4. Create credentials (API Key) with these settings:
   - **Application restrictions**: Select "Websites" and add `http://localhost:3000/*` (and your production domain)
   - **API restrictions**: Select "Restrict key" and choose only "Maps JavaScript API" and "Geocoding API"
5. Add the API key to your `.env.local` file

**See `GOOGLE_MAPS_SETUP.md` for detailed step-by-step instructions.**

### 4. Run the Development Server

```bash
npm run dev
```

The application will run on **http://localhost:3000**

## Project Structure

```
├── app/
│   ├── admin/              # Admin dashboard pages
│   │   ├── forms/         # Form management
│   │   └── submissions/   # Submissions management
│   ├── form/[slug]/       # Public form pages
│   └── page.tsx           # Home page
├── components/
│   ├── AdminLayout.tsx    # Admin navigation layout
│   ├── FormEditor.tsx     # Form editing interface
│   ├── FieldEditor.tsx    # Field editing modal
│   ├── PublicForm.tsx     # Public form renderer
│   ├── SubmissionsView.tsx # Submissions management
│   └── SubmissionCount.tsx # Submission count component
├── lib/
│   └── supabase/          # Supabase client configuration
└── supabase/
    └── schema.sql         # Database schema
```

## Usage

### Creating a Form

1. Navigate to `/admin/forms`
2. Click "Create New Form"
3. Fill in form name, description, and status
4. Add fields using the "Add Field" button
5. Configure each field (type, required, placeholder, options)
6. Set form status to "Active" to make it publicly accessible

### Accessing Public Forms

Public forms are accessible at: `/form/{public_url}`

The public URL is auto-generated when creating a form and can be found in the form editor.

### Managing Submissions

1. Navigate to `/admin/submissions`
2. Select a form from the dropdown (or view all)
3. View all submissions in a table
4. Use search to filter submissions
5. Click "View" to see full submission details
6. Export to Excel using the "Export to Excel" button

### Viewing Locations on Map

1. Navigate to `/admin/map`
2. View all submitted locations on an interactive map of Tunisia
3. Click on markers to see location details
4. Click on location cards to zoom to that location

## Database Schema

- **forms**: Stores form metadata
- **fields**: Stores form field configurations
- **submissions**: Stores submission records
- **submission_values**: Stores individual field values for each submission

## Authentication

- **Public Forms**: No authentication required - anyone can view active forms and submit
- **Admin Dashboard**: Authentication required - login at `/auth/login`
- Create your first admin account by signing up at the login page

## Security

- Row Level Security (RLS) is enabled on all tables
- Public users can only view active forms and create submissions
- Authenticated users (admins) have full access to manage forms and view submissions
- All admin routes are protected by middleware

## Development Notes

- The app runs on port 3000 by default
- Hot reload is enabled for development
- TypeScript is used for type safety
- Tailwind CSS is used for styling

## Future Enhancements

- File upload fields
- Conditional logic (show/hide fields based on other field values)
- Multi-step forms
- Email notifications
- Multiple admin accounts with permissions
- API access for integrations

## License

MIT
