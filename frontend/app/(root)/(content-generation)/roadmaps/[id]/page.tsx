import { redirect } from 'next/navigation';
import RoadmapClient from '@/app/components/RoadmapClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Learning Roadmap",
    description: "Your personalized learning path",
}

interface StudyPlanResource {
  title: string;
  url: string;
  description: string;
  type: string;
}

interface StudyPlanSection {
  title: string;
  description: string;
  topics: string[];
  resources: StudyPlanResource[];
  activities: string[];
  estimated_time: string;
  assessment_methods: string[];
}

interface StudyPlan {
  id: number;
  topic: string;
  overview: string;
  learning_objectives: string[];
  sections: StudyPlanSection[];
  total_estimated_time: string;
  created_at: string;
}

async function getStudyPlan(id: string): Promise<StudyPlan | null> {
  try {
    const response = await fetch(`http://127.0.0.1:8000/studyplan/${id}`, {
      // Add cache configuration as needed
      next: { revalidate: 3600 }, 
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch study plan with ID ${id}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching study plan:', error);
    return null;
  }
}

export default async function RoadmapPage({ params }: { params: { id: string } }) {
  const studyPlan = await getStudyPlan(params.id);
  
  // If error fetching study plan, redirect to error page or show error message
  if (!studyPlan) {
    // You could return an error component instead of redirecting
    redirect('/error?message=Failed+to+load+roadmap');
  }
  
  // Format the date on server
  const formattedDate = new Date(studyPlan.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Pass the fetched data to the client component
  return <RoadmapClient studyPlan={studyPlan} formattedDate={formattedDate} />;
}