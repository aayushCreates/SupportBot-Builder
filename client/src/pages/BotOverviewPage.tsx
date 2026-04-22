import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Bot as BotIcon } from 'lucide-react';
import type { Bot } from '../types';
import Card from '../components/ui/Card';

const BotOverviewPage: React.FC = () => {
  const { bot } = useOutletContext<{ bot: Bot }>();

  return (
    <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-2 space-y-8">
        {/* Quick Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="p-4 flex flex-col items-center justify-center text-center gap-1 border-blue-50 bg-blue-50/10">
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">Total Messages</span>
            <span className="text-2xl font-black text-gray-900">{bot.messageCount}</span>
          </Card>
          <Card className="p-4 flex flex-col items-center justify-center text-center gap-1">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Sources</span>
            <span className="text-2xl font-black text-gray-900">{bot._count?.sources || 0}</span>
          </Card>
          <Card className="p-4 flex flex-col items-center justify-center text-center gap-1">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Conversations</span>
            <span className="text-2xl font-black text-gray-900">{bot._count?.conversations || 0}</span>
          </Card>
        </div>

        {/* Performance Chart Placeholder */}
        <Card className="h-80 flex flex-col items-center justify-center border-dashed border-2">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-gray-900">Analytics coming soon</p>
            <p className="text-xs text-gray-400 px-8">We're building advanced insights to help you track your bot's performance.</p>
          </div>
        </Card>
      </div>

      {/* Right Sidebar: Chat Preview */}
      <div className="space-y-6">
        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Test your bot</span>
        <Card className="p-0 overflow-hidden h-[500px] flex flex-col shadow-xl">
          <div style={{ backgroundColor: bot.primaryColor || '#6c8aff' }} className="p-4 flex items-center justify-between text-white">
            <span className="font-bold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              Live Preview
            </span>
          </div>
          <div className="flex-1 bg-gray-50 p-4 space-y-4 overflow-y-auto flex flex-col">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400"><BotIcon className="w-4 h-4" /></div>
              <div className="bg-white p-3 rounded-2xl rounded-tl-none text-xs text-gray-700 max-w-[85%] shadow-sm border border-gray-100 font-medium">
                {bot.welcomeMessage || 'Hi! How can I help you?'}
              </div>
            </div>
            <div className="mt-auto text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter italic">Preview Mode — No real data sent</p>
            </div>
          </div>
          <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
            <input 
              type="text" 
              placeholder="Ask a question..."
              className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-xs focus:ring-0" 
              disabled 
            />
            <div style={{ backgroundColor: bot.primaryColor || '#6c8aff' }} className="w-10 h-10 rounded-xl flex items-center justify-center text-white cursor-pointer opacity-50">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BotOverviewPage;
