import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to the main survey embed page
  redirect('/embed');
}