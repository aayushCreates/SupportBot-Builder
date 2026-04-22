import React from 'react';
import { useParams, NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Database, MessageSquare, Settings, ExternalLink, Bot as BotIcon, RefreshCw, AlertCircle } from 'lucide-react';
import { useBots } from '../../hooks/useBots';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { cn } from '../../utils/helpers';

const BotLayout: React.FC = () => {
  const { botId } = useParams<{ botId: string }>();
  const { useBotQuery, trainBotMutation } = useBots();
  const { data: bot, isLoading, error } = useBotQuery(botId);

  if (isLoading) return <div className="h-full flex items-center justify-center"><Spinner size="lg" /></div>;
  if (error || !bot) return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">Bot not found</h2>
      <p className="text-gray-500 mb-6">The bot you are looking for does not exist or you don't have access.</p>
      <Button onClick={() => window.history.back()}>Go Back</Button>
    </div>
  );

  const tabs = [
    { label: 'Overview', path: `/bots/${bot.id}`, icon: LayoutDashboard, end: true },
    { label: 'Knowledge Base', path: `/bots/${bot.id}/sources`, icon: Database },
    { label: 'Conversations', path: `/bots/${bot.id}/conversations`, icon: MessageSquare },
    { label: 'Settings', path: `/bots/${bot.id}/settings`, icon: Settings },
    { label: 'Integration', path: `/bots/${bot.id}/embed`, icon: ExternalLink },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
      {/* Bot Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-center text-gray-400 shrink-0">
             <BotIcon className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{bot.name}</h1>
              <Badge variant={bot.status as any}>{bot.status}</Badge>
            </div>
            <p className="text-gray-500 font-medium max-w-lg">{bot.description || 'No description provided.'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            isLoading={trainBotMutation.isPending}
            onClick={() => trainBotMutation.mutate(bot.id)}
            className="bg-white border-gray-100 shadow-sm"
          >
            <RefreshCw className={cn("w-4 h-4", trainBotMutation.isPending && "animate-spin")} />
            Retrain Bot
          </Button>
          <Button variant="outline" onClick={() => window.open(`/bots/${bot.id}/embed`, '_self')}>
            <ExternalLink className="w-4 h-4" />
            Connect Widget
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-100 flex items-center gap-8 overflow-x-auto no-scrollbar shrink-0">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.end}
            className={({ isActive }) => cn(
              "flex items-center gap-2 py-4 border-b-2 transition-all font-bold text-sm whitespace-nowrap",
              isActive ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </NavLink>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0">
        <Outlet context={{ bot }} />
      </div>
    </div>
  );
};

export default BotLayout;
