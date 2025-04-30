import ReferenceClient from '@/app/components/ReferenceClient';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: "Quick Reference Guide",
  description: "Condensed reference guide for your learning journey"
}

interface QuickReference {
  id: number;
  topic: string;
  content: string;
  created_at: string;
}

async function getQuickReference(id: string): Promise<QuickReference | null> {
  try {
    const response = await fetch(`http://127.0.0.1:8000/studyplan/${id}/reference`, {
      next: { revalidate: 3600 }, // Revalidate every hour
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch reference guide for roadmap ${id}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching quick reference:', error);
    return null;
  }
}

export default async function ReferencePage({ params }: { params: { id: string } }) {
  const reference = await getQuickReference(params.id);
  
  // If error fetching reference, redirect to error page
  if (!reference) {
    redirect('/error?message=Failed+to+load+reference+guide');
  }
  
  return <ReferenceClient reference={reference} id={params.id} />;
}