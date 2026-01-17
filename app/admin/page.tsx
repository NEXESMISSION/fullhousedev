import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  // Redirect to map page as the main admin page
  redirect('/admin/map')
}
