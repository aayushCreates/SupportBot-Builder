import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MessageSquare, Search, ChevronRight, User, Bot as BotIcon, Clock, Trash2 } from 'lucide-react';
import type { Bot } from '../types';
import { useConversations } from '../hooks/useConversations';
import Spinner from '../components/ui/Spinner';
import { cn, formatDate } from '../utils/helpers';
import { toast } from 'sonner';

const ConversationsPage: React.FC = () => {
  const { bot } = useOutletContext<{ bot: Bot }>();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    useConversationsQuery, 
    useConversationDetailQuery,
    clearConversationsMutation 
  } = useConversations(bot.id);
  
  const { data: conversations, isLoading: isLoadingList } = useConversationsQuery();
  const { data: detail, isLoading: isLoadingDetail } = useConversationDetailQuery(selectedId || undefined);

  const filteredConversations = conversations?.data.filter(c => 
    c.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.messages?.some(m => m.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete ALL conversation history for this bot? This cannot be undone.')) {
      try {
        await clearConversationsMutation.mutateAsync();
        toast.success('Conversation history cleared');
        setSelectedId(null);
      } catch (error: any) {
        toast.error(error.message || 'Failed to clear conversations');
      }
    }
  };

  return (
    <div className="flex bg-white rounded-3xl border border-gray-100 overflow-hidden h-[calc(100vh-320px)] min-h-[500px] shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sidebar: Conversation List */}
      <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/30">
        <div className="p-4 border-b border-gray-100 space-y-3 shrink-0 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">History</h3>
            <button 
              onClick={handleClearAll}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Clear all history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Filter by session..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border-gray-200 rounded-xl py-2 pl-10 pr-4 text-xs focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {isLoadingList ? (
            <div className="p-8 text-center"><Spinner size="sm" /></div>
          ) : filteredConversations?.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-gray-200 mx-auto" />
              <p className="text-xs text-gray-400 font-medium italic">No conversations found</p>
            </div>
          ) : (
            filteredConversations?.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  "w-full text-left p-4 border-b border-gray-50 transition-all flex items-center gap-3 group relative",
                  selectedId === c.id ? "bg-white border-l-4 border-l-blue-600 shadow-sm" : "hover:bg-white"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                  selectedId === c.id ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600"
                )}>
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-xs font-bold text-gray-900 truncate">Session: {c.sessionId.slice(0, 8)}</p>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{formatDate(c.createdAt)}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-medium truncate">
                     {c._count?.messages || 0} messages total
                  </p>
                </div>
                <ChevronRight className={cn(
                  "w-4 h-4 transition-all opacity-0 group-hover:opacity-100",
                  selectedId === c.id ? "text-blue-600 opacity-100" : "text-gray-300"
                )} />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main: Message Thread */}
      <div className="flex-1 flex flex-col bg-white">
        {!selectedId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-6">
               <MessageSquare className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-sm text-gray-400 max-w-xs">Pick a session from the list on the left to view the full message history.</p>
          </div>
        ) : isLoadingDetail ? (
          <div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div>
        ) : !detail ? (
          <div className="flex-1 flex items-center justify-center text-red-500 font-bold">Failed to load conversation details.</div>
        ) : (
          <>
            {/* Thread Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                     <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">User Session: {detail.sessionId}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                       <Clock className="w-3 h-3" />
                       Started {formatDate(detail.createdAt)}
                    </div>
                  </div>
               </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
               {detail.messages?.map((m) => (
                  <div 
                    key={m.id} 
                    className={cn(
                      "flex items-start gap-3 max-w-[85%]",
                      m.role === 'user' ? "ml-auto flex-row-reverse" : ""
                    )}
                  >
                     <div className={cn(
                       "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                       m.role === 'user' ? "bg-blue-600 text-white" : "bg-white border border-gray-100 text-gray-400 shadow-sm"
                     )}>
                        {m.role === 'user' ? <User className="w-4 h-4" /> : <BotIcon className="w-4 h-4" />}
                     </div>
                     <div className="space-y-1">
                        <div className={cn(
                          "p-4 rounded-2xl shadow-sm border",
                          m.role === 'user' 
                            ? "bg-blue-600 border-transparent text-white rounded-tr-none" 
                            : "bg-white border-gray-100 text-gray-800 rounded-tl-none font-medium text-sm leading-relaxed"
                        )}>
                           {m.content}
                        </div>
                        <p className={cn(
                          "text-[10px] font-bold uppercase text-gray-400 tracking-wider",
                          m.role === 'user' ? "text-right" : ""
                        )}>
                           {m.role === 'user' ? 'You' : bot.name} • {formatDate(m.createdAt)}
                        </p>
                     </div>
                  </div>
               ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConversationsPage;
