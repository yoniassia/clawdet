'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function OnboardingPage() {
  const [checklist, setChecklist] = useState({
    accessInstance: false,
    sayHello: false,
    exploreWorkspace: false,
    editUserMd: false,
    editAgentsMd: false,
    testCommand: false,
  });

  useEffect(() => {
    // Load checklist from localStorage
    const saved = localStorage.getItem('onboarding-checklist');
    if (saved) {
      setChecklist(JSON.parse(saved));
    }
  }, []);

  const toggleItem = (key: keyof typeof checklist) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    localStorage.setItem('onboarding-checklist', JSON.stringify(updated));
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalCount = Object.keys(checklist).length;
  const progress = (completedCount / totalCount) * 100;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome to Clawdet! 🎉</h1>
            <p className="text-gray-400 text-sm">Get started with your personal AI assistant</p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Back to Dashboard →
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Your Progress</span>
            <span className="text-sm text-gray-400">
              {completedCount} of {totalCount} completed
            </span>
          </div>
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Quick Start Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            🚀 Quick Start (5 minutes)
          </h2>

          <div className="space-y-4">
            <ChecklistItem
              checked={checklist.accessInstance}
              onToggle={() => toggleItem('accessInstance')}
              title="Verify Your Instance is Running"
              description="Visit your instance URL and make sure it loads properly"
            />

            <ChecklistItem
              checked={checklist.sayHello}
              onToggle={() => toggleItem('sayHello')}
              title="Say Hello to Your AI"
              description='Send a message: "Hello! Tell me about yourself and what you can do."'
            />

            <ChecklistItem
              checked={checklist.exploreWorkspace}
              onToggle={() => toggleItem('exploreWorkspace')}
              title="Explore the Workspace"
              description='Ask: "Show me what files are in my workspace"'
            />
          </div>
        </section>

        {/* Customization Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-green-400 to-cyan-500 bg-clip-text text-transparent">
            📝 Customization (15 minutes)
          </h2>

          <div className="space-y-4">
            <ChecklistItem
              checked={checklist.editUserMd}
              onToggle={() => toggleItem('editUserMd')}
              title="Personalize USER.md"
              description="Tell your AI about yourself - name, interests, goals, communication style"
            />

            <ChecklistItem
              checked={checklist.editAgentsMd}
              onToggle={() => toggleItem('editAgentsMd')}
              title="Define AI Personality in AGENTS.md"
              description="Customize how your AI behaves and communicates"
            />

            <ChecklistItem
              checked={checklist.testCommand}
              onToggle={() => toggleItem('testCommand')}
              title="Test a Command"
              description='Try: "Create a new file called test.md with some notes"'
            />
          </div>
        </section>

        {/* Feature Cards */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Essential Features to Explore</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard
              icon="📁"
              title="File Management"
              description="Create, read, edit, and organize files in your workspace"
              example='"Create a project folder structure for my new app"'
            />

            <FeatureCard
              icon="🌐"
              title="Web Browsing"
              description="Search the web and fetch content from any URL"
              example='"Search for the latest Next.js features"'
            />

            <FeatureCard
              icon="⚙️"
              title="Code Execution"
              description="Run commands and scripts directly on your server"
              example='"Check the disk space on my server"'
            />

            <FeatureCard
              icon="⏰"
              title="Scheduled Tasks"
              description="Set up recurring reminders and automated tasks"
              example='"Remind me every Monday at 9 AM to review my goals"'
            />

            <FeatureCard
              icon="🧠"
              title="Memory & Recall"
              description="Your AI remembers conversations across sessions"
              example='"Remember that I prefer TypeScript over JavaScript"'
            />

            <FeatureCard
              icon="🔗"
              title="Integrations"
              description="Connect to X/Twitter, GitHub, Slack, and more"
              example='"Connect my X account to post updates"'
            />
          </div>
        </section>

        {/* Resources */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Resources</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <ResourceCard
              title="📖 User Guide"
              description="Complete guide to using Clawdet"
              link="https://github.com/clawdet/docs"
            />

            <ResourceCard
              title="❓ FAQ"
              description="Common questions answered"
              link="https://github.com/clawdet/docs/FAQ"
            />

            <ResourceCard
              title="💬 Support"
              description="Get help from our team"
              link="mailto:support@clawdet.com"
            />
          </div>
        </section>

        {/* Next Steps */}
        <section className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-8 border border-blue-800/30">
          <h2 className="text-2xl font-bold mb-4">🎯 What's Next?</h2>
          <div className="space-y-3 text-gray-300">
            <p>✨ Start with simple requests to build confidence</p>
            <p>🔧 Gradually explore advanced features</p>
            <p>🎨 Customize your AI's behavior to match your style</p>
            <p>⚡ Set up automations to save time</p>
            <p>💬 Share feedback with us!</p>
          </div>

          <div className="mt-6 flex gap-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition"
            >
              Go to Dashboard
            </Link>
            <a
              href="mailto:support@clawdet.com"
              className="px-6 py-3 border border-gray-700 hover:border-gray-600 rounded-lg font-semibold transition"
            >
              Contact Support
            </a>
          </div>
        </section>

        {/* Completion Message */}
        {progress === 100 && (
          <div className="mt-8 bg-green-900/20 border border-green-800/30 rounded-lg p-6 text-center">
            <p className="text-xl font-semibold text-green-400 mb-2">
              🎊 Congratulations! You've completed onboarding!
            </p>
            <p className="text-gray-300">
              You're all set to make the most of your Clawdet instance. Happy building! 🚀
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function ChecklistItem({
  checked,
  onToggle,
  title,
  description,
}: {
  checked: boolean;
  onToggle: () => void;
  title: string;
  description: string;
}) {
  return (
    <div
      onClick={onToggle}
      className={`p-4 rounded-lg border cursor-pointer transition ${
        checked
          ? 'bg-green-900/20 border-green-800/50'
          : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
            checked ? 'bg-green-600 border-green-600' : 'border-gray-600'
          }`}
        >
          {checked && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold mb-1 ${checked ? 'text-green-400' : 'text-white'}`}>
            {title}
          </h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  example,
}: {
  icon: string;
  title: string;
  description: string;
  example: string;
}) {
  return (
    <div className="p-6 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-400 mb-3">{description}</p>
      <div className="text-xs text-gray-500 font-mono bg-black/50 p-2 rounded border border-gray-800">
        Try: {example}
      </div>
    </div>
  );
}

function ResourceCard({
  title,
  description,
  link,
}: {
  title: string;
  description: string;
  link: string;
}) {
  return (
    <a
      href={link}
      className="p-6 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-gray-700 hover:bg-gray-900/70 transition group"
    >
      <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition">
        {title}
      </h3>
      <p className="text-sm text-gray-400">{description}</p>
    </a>
  );
}
