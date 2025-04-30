import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import SummaryClient from '@/app/components/SummaryClient';

export const metadata: Metadata = {
  title: 'Summary Details',
  description: 'View your generated content summary'
}

interface Summary {
  id: number
  content: string
  original_filename: string
  word_count: number
  detail_level: string
  created_at: string
}

async function getSummary(id: string): Promise<Summary | null> {
  try {
    const response = await fetch(`http://127.0.0.1:8000/summary/${id}`, {
      next: { revalidate: 3600 }, // Revalidate every hour
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch summary with ID ${id}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching summary:', error);
    return null;
  }
}

export default async function SummaryPage({ params }: { params: { id: string } }) {
  const summary = await getSummary(params.id);

  if (!summary) {
    redirect('/profile');
  }

  // Format the date on server
  const formattedDate = new Date(summary.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <SummaryClient summary={summary} formattedDate={formattedDate} />
  )
}