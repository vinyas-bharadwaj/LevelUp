'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Alert from '@/app/components/alert'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import { FileText, Calendar, Tag, BarChart2, Trash2, ChevronLeft, Plus, Download, Share } from 'lucide-react'

interface Summary {
  id: number
  content: string
  original_filename: string
  word_count: number
  detail_level: string
  created_at: string
}

const SummaryPageContent = () => {
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
        router.push('/profile')
      } else {
        setError('Failed to delete summary')
      }
    } catch (err) {
      console.error('Error deleting summary:', err)
      setError('An error occurred while deleting the summary')
    }
  }
  
  const handleExportAsPDF = () => {
    // Placeholder for PDF export functionality
    window.print();
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
            className="px-4 py-2 bg-[#2C3E50] text-white rounded hover:bg-[#44505c] border-2 border-gray-800"
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
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-2 border-gray-800">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2 text-[#2C3E50]">Summary</h1>
            <div className="flex flex-wrap gap-2 items-center text-sm text-[#4A4A4A]">
              <div className="flex items-center">
                <FileText size={16} className="mr-1" />
                <span>{summary.original_filename || 'Unnamed document'}</span>
              </div>
              <span className="text-gray-400">•</span>
              <div className="flex items-center">
                <Calendar size={16} className="mr-1" />
                <span>{formattedDate}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <div className="flex items-center px-2 py-1 text-xs rounded bg-[#E0E6ED] text-[#2C3E50] border border-gray-800">
                <Tag size={12} className="mr-1" />
                <span>{summary.detail_level} detail</span>
              </div>
              <div className="flex items-center px-2 py-1 text-xs rounded bg-[#E0E6ED] text-[#2C3E50] border border-gray-800">
                <BarChart2 size={12} className="mr-1" />
                <span>~{summary.word_count} words</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleExportAsPDF}
              className="flex items-center text-[#2C3E50] hover:text-[#44505c] border-2 border-gray-800 rounded px-3 py-1.5 transition-colors"
              title="Export as PDF"
            >
              <Download size={16} className="mr-1.5" />
              <span>Export</span>
            </button>
            <button 
              onClick={handleDelete}
              className="flex items-center text-red-500 hover:text-red-700 border-2 border-red-300 hover:border-red-500 rounded px-3 py-1.5 transition-colors"
              title="Delete summary"
            >
              <Trash2 size={16} className="mr-1.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
        
        {/* Enhanced markdown container with print-friendly styling */}
        <div className="mt-6 px-6 py-6 bg-[#F8FAFC] rounded-lg border-2 border-gray-800" id="markdown-content">
          <article className="prose prose-lg max-w-none
            prose-headings:text-[#2C3E50] 
            prose-h1:text-2xl prose-h1:font-bold prose-h1:border-b prose-h1:border-gray-300 prose-h1:pb-2
            prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-6 
            prose-h3:text-lg prose-h3:font-medium
            prose-p:text-[#4A4A4A] prose-p:leading-relaxed
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-l-4 prose-blockquote:border-[#2C3E50] prose-blockquote:bg-[#E0E6ED] prose-blockquote:py-1 prose-blockquote:pl-4 prose-blockquote:italic
            prose-ul:list-disc prose-ul:pl-5
            prose-ol:list-decimal prose-ol:pl-5
            prose-li:my-1
            prose-table:border-collapse prose-table:w-full
            prose-th:bg-[#E0E6ED] prose-th:text-[#2C3E50] prose-th:p-2 prose-th:font-medium prose-th:border prose-th:border-gray-300
            prose-td:border prose-td:border-gray-300 prose-td:p-2
            prose-hr:my-6 prose-hr:border-t prose-hr:border-gray-300
            prose-strong:font-bold prose-strong:text-[#2C3E50]
            prose-em:italic"
          >
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
            >
              {summary.content}
            </ReactMarkdown>
          </article>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={() => router.push('/profile')}
          className="flex items-center px-4 py-2 bg-[#E0E6ED] text-[#2C3E50] rounded hover:bg-[#CCD6E0] transition-colors border-2 border-gray-800"
        >
          <ChevronLeft size={18} className="mr-1" />
          Back to Profile
        </button>
        <button
          onClick={() => router.push('/summaries/create')}
          className="flex items-center px-4 py-2 bg-[#354554] text-white rounded hover:bg-[#4f5862] transition-colors border-2 border-gray-800"
        >
          <Plus size={18} className="mr-1" />
          Create New Summary
        </button>
      </div>
    </div>
  )
}

export default SummaryPageContent;