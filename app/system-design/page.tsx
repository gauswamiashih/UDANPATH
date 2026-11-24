'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Network, 
  ExternalLink, 
  Download, 
  Printer, 
  Layers, 
  Database, 
  GitBranch, 
  ArrowLeft,
  Maximize2,
  FileText,
  Search,
  Sparkles
} from 'lucide-react';

export default function SystemDesignPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Banner Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/student"
            className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Portal
          </Link>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
              <Network className="w-5 h-5 text-blue-400" />
              UdanPath System Analysis & Design Studio
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Interactive Diagram Generator (39 Production Engineering Diagrams & Schema Blueprints)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/system-design/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            Launch Fullscreen Portal
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>
      </header>

      {/* Quick Stats & Categories Bar */}
      <div className="bg-slate-900/50 border-b border-slate-800/60 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-400" /> Modules:
          </span>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2.5 py-1 rounded-full font-medium transition ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            All 39 Diagrams
          </button>
          <button
            onClick={() => setSelectedCategory('UML')}
            className={`px-2.5 py-1 rounded-full font-medium transition ${
              selectedCategory === 'UML'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            13 UML Diagrams
          </button>
          <button
            onClick={() => setSelectedCategory('DFD')}
            className={`px-2.5 py-1 rounded-full font-medium transition ${
              selectedCategory === 'DFD'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            12 DFD Levels 0–2
          </button>
          <button
            onClick={() => setSelectedCategory('DB')}
            className={`px-2.5 py-1 rounded-full font-medium transition ${
              selectedCategory === 'DB'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            6 Database Models
          </button>
          <button
            onClick={() => setSelectedCategory('ARCH')}
            className={`px-2.5 py-1 rounded-full font-medium transition ${
              selectedCategory === 'ARCH'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            8 System Design & Matrices
          </button>
        </div>

        <div className="text-slate-400 text-xs hidden lg:flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Export: SVG • PNG • PDF
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            Zoom & Pan Supported
          </span>
        </div>
      </div>

      {/* Main Interactive Diagram Generator Frame */}
      <div className="flex-grow relative w-full h-[calc(100vh-110px)] bg-slate-950">
        <iframe
          src="/system-design/index.html"
          title="UdanPath System Analysis and Design Diagram Generator"
          className="w-full h-full border-none"
        />
      </div>
    </div>
  );
}
