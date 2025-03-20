'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Alert from '@/app/components/alert'

interface Summary {
  id: number
  content: string
  original_filename: string
  word_count: number
  detail_level: string
  created_at: string
}

export default function SummaryPage() {
  const params = useParams()
  const router = useRouter()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true)
      setError(null)
      
      const id = params.id
      if (!id) {
        setError('Summary ID not found')
        setLoading(false)
        return
      }
      
      try {
        const authTokens = localStorage.getItem('authTokens')
        if (!authTokens) {
          router.push('/login')
          return
        }
        
        const tokens = JSON.parse(authTokens)
        const accessToken = tokens.access_token
        
        const response = await fetch(`http://127.0.0.1:8000/summary/${id}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Summary not found')
          } else if (response.status === 401) {
            router.push('/login')
            return
          } else {
            setError('Failed to load summary')
          }
          setLoading(false)
          return
        }
        
        const data = await response.json()
        setSummary(data)
      } catch (err) {
        console.error('Error fetching summary:', err)
        setError('An error occurred while fetching the summary')
      } finally {
        setLoading(false)
      }
    }
    
    fetchSummary()
  }, [params.id, router])
  
  const handleDelete = async () => {
    if (!summary?.id) return
    
    if (!confirm('Are you sure you want to delete this summary?')) {
      return
    }
    
    try {
      const authTokens = localStorage.getItem('authTokens')
      if (!authTokens) {
        router.push('/login')
        return
      }
      
      const tokens = JSON.parse(authTokens)
      const accessToken = tokens.access_token
      
      const response = await fetch(`http://127.0.0.1:8000/summary/${summary.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      
      if (response.ok) {
        router.push('/summaries')
      } else {
        setError('Failed to delete summary')
      }
    } catch (err) {
      console.error('Error deleting summary:', err)
      setError('An error occurred while deleting the summary')
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2C3E50]"></div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert type="error" message={error} />
        <div className="mt-4">
          <button
            onClick={() => router.push('/profile')}
            className="px-4 py-2 bg-[#2C3E50] text-white rounded hover:bg-[#44505c]"
          >
            Back to Profile
          </button>
        </div>
      </div>
    )
  }
  
  if (!summary) {
    return null
  }
  
  // Format the date
  const formattedDate = new Date(summary.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Summary</h1>
            <p className="text-sm text-gray-600">
              From: {summary.original_filename} • Created on {formattedDate}
            </p>
            <div className="flex gap-2 mt-2">
              <span className="inline-block px-2 py-1 text-xs rounded bg-gray-100">
                {summary.detail_level} detail
              </span>
              <span className="inline-block px-2 py-1 text-xs rounded bg-gray-100">
                ~{summary.word_count} words
              </span>
            </div>
          </div>
          <button 
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700"
            title="Delete summary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
        </div>
        
        <div className="mt-6 prose prose-slate max-w-none">
          {summary.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">{paragraph}</p>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={() => router.push('/profile')}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Back to Profile
        </button>
        <button
          onClick={() => router.push('/summaries/create')}
          className="px-4 py-2 bg-[#2C3E50] text-white rounded hover:bg-[#44505c]"
        >
          Create New Summary
        </button>
      </div>
    </div>
  )
}