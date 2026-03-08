import { NextResponse } from 'next/server'

const TEMPLATES = [
  {
    id: 'default',
    name: '🐾 General Assistant',
    description: 'Versatile AI with web search, code execution, memory, and more',
    skills: ['web_search', 'bash', 'memory', 'planner', 'news', 'image_gen'],
    color: '#2EE68A'
  },
  {
    id: 'research',
    name: '🔍 Research Agent',
    description: 'Deep web research, academic papers, news monitoring, knowledge management',
    skills: ['web_search_brave', 'news', 'memory', 'academic_search'],
    color: '#1d9bf0'
  },
  {
    id: 'productivity',
    name: '✅ Productivity Agent',
    description: 'Daily planning, task tracking, note-taking, personal organization',
    skills: ['planner', 'memory', 'notes', 'web_search'],
    color: '#f59e0b'
  },
  {
    id: 'creative',
    name: '🎨 Creative Agent',
    description: 'Image generation, creative writing, content creation, visual design',
    skills: ['image_gen', 'web_search', 'memory', 'writing'],
    color: '#ec4899'
  },
  {
    id: 'developer',
    name: '💻 Developer Agent',
    description: 'Code execution, debugging, Git, API integration, documentation',
    skills: ['bash', 'code_exec', 'git', 'web_search', 'docs'],
    color: '#8b5cf6'
  }
]

export async function GET() {
  return NextResponse.json({ templates: TEMPLATES })
}
