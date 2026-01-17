# Dynamic Form Builder Platform

A comprehensive web platform that allows business owners to create multiple public forms, define custom fields, collect submissions, and manage all data from a centralized dashboard.

## Features

- **Form Management**: Create, edit, and delete forms with custom configurations
- **Field Management**: Add, edit, reorder, and configure fields (text, number, email, phone, textarea, select, checkbox, date)
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
3. Run the SQL schema from `supabase/schema.sql` to create all tables and policies

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under API.

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
2. Select a form from the dropdown
3. View all submissions in a table
4. Use search to filter submissions
5. Click "View" to see full submission details
6. Export to Excel using the "Export to Excel" button

## Database Schema

- **forms**: Stores form metadata
- **fields**: Stores form field configurations
- **submissions**: Stores submission records
- **submission_values**: Stores individual field values for each submission

## Security

- Row Level Security (RLS) is enabled on all tables
- Public users can only view active forms and create submissions
- Authenticated users (admins) have full access to manage forms and view submissions

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
