/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, ToolType } from './components/Sidebar';
import { SeoExtractor } from './components/SeoExtractor';
import { StaticScraper } from './components/StaticScraper';
import { FrameExtractor } from './components/FrameExtractor';
import { PlaywrightInspector } from './components/PlaywrightInspector';
import { AiAssistant } from './components/AiAssistant';
import { ScrapeHistoryModal } from './components/ScrapeHistoryModal';
import { ScrapeHistoryItem } from './types/scraper';

export default function App() {
  const [currentTool, setCurrentTool] = useState<ToolType>('SEO & Keyword Extractor');
  const [isRtl, setIsRtl] = useState(true);
  const [history, setHistory] = useState<ScrapeHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('scraper_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Sync RTL attribute on document root
  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = isRtl ? 'ar' : 'en';
  }, [isRtl]);

  const handleScrapeCompleted = (url: string, title?: string) => {
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.url !== url);
      const updated = [
        {
          id: Date.now().toString(),
          url,
          title,
          tool: currentTool,
          timestamp: Date.now(),
        },
        ...filtered,
      ].slice(0, 30);

      try {
        localStorage.setItem('scraper_history', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save history: ', e);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('scraper_history');
    } catch (e) {
      console.error('Failed to clear history: ', e);
    }
  };

  const renderActiveTool = () => {
    switch (currentTool) {
      case 'SEO & Keyword Extractor':
        return <SeoExtractor onScrapeCompleted={handleScrapeCompleted} />;
      case 'Requests & BS4':
        return <StaticScraper onScrapeCompleted={handleScrapeCompleted} />;
      case 'Selenium (Extract Frames)':
        return <FrameExtractor onScrapeCompleted={handleScrapeCompleted} />;
      case 'Playwright':
        return <PlaywrightInspector onScrapeCompleted={handleScrapeCompleted} />;
      case 'Ollama Assistant':
        return <AiAssistant />;
      default:
        return <SeoExtractor onScrapeCompleted={handleScrapeCompleted} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1117] text-slate-100 flex flex-col font-['Cairo',sans-serif]">
      {/* Top Navigation */}
      <Navbar
        activeTab={currentTool}
        onTabChange={(tab) => setCurrentTool(tab as ToolType)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        isRtl={isRtl}
        onToggleRtl={() => setIsRtl(!isRtl)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTool={currentTool}
          onSelectTool={(tool) => setCurrentTool(tool)}
        />

        {/* Content Canvas */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {renderActiveTool()}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#30363d] bg-[#161b22] py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>All-in-One Scraper Pro © 2026 — محرك كشط الويب المتقدم وتحليل الـ SEO</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>محرك الخادم: Express + Cheerio</span>
            <span>الذكاء الاصطناعي: Gemini 3.8 Flash & Ollama API</span>
          </div>
        </div>
      </footer>

      {/* History Drawer Modal */}
      <ScrapeHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={history}
        onSelectUrl={(url) => {
          // If in an extractor tab, it will let user inspect
          setIsHistoryOpen(false);
        }}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
