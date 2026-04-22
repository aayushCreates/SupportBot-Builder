import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  MessageSquare,
  Database,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  BarChart3,
  Clock,
  Settings,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useBots } from "../hooks/useBots";
import { cn } from "../utils/helpers";
import Button from "../components/ui/Button";

const BotsPage: React.FC = () => {
  const navigate = useNavigate();
  const { useBotsQuery } = useBots();
  const { data: bots, isLoading, error, refetch } = useBotsQuery();

  if (isLoading) {
    return (
      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <div className="h-10 w-48 bg-bg-tertiary animate-shimmer rounded-xl"></div>
          <div className="h-10 w-32 bg-bg-tertiary animate-shimmer rounded-xl"></div>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-80 bg-bg-tertiary animate-shimmer rounded-[32px] border border-border"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 bg-danger-bg rounded-full flex items-center justify-center text-danger mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Failed to load bots
        </h2>
        <p className="text-text-secondary mb-8 max-w-sm">
          We ran into an issue connecting to the server. Please check your
          connection and try again.
        </p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h1 className="text-2xl font-semibold">My Bots</h1>
        <Button
          onClick={() => navigate("/bots/new")}
          className="rounded-md px-6 py-2.5 bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30 hover:border-primary/60 hover:text-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Bot
        </Button>
      </div>

      {/* Bots Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
        {bots?.map((bot) => (
          <div
            key={bot.id}
            onClick={() => navigate(`/bots/${bot.id}`)}
            className="group bg-card rounded-lg border border-border p-5 transition-all duration-500 cursor-pointer relative flex flex-col"
          >
            {/* Main Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full shrink-0 animate-pulse-dot",
                    bot.status === "ready" ? "bg-info" : "bg-success",
                  )}
                />
                <h3 className="text-lg font-semibold text-card-foreground">
                  {bot.name}
                </h3>
              </div>
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold uppercase",
                  bot.status === "ready"
                    ? "bg-success-bg/60 text-success border border-success/10"
                    : "bg-warning-bg/60 text-warning border border-warning/10",
                )}
              >
                {bot.status === "ready" ? "Ready" : "Not trained"}
              </span>
            </div>

            {/* Description */}
            <p className="text-text-secondary text-xs mb-5 line-clamp-2 leading-relaxed h-10">
              {bot.description || "No description provided for this assistant."}
            </p>

            <div className="w-full h-px bg-border mb-4" />

            {/* Stats Bar */}
            <div className="flex items-center gap-6 mb-3 text-text-tertiary">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span className="text-xs tracking-tight text-text-secondary">
                  {bot._count?.sources || 0} sources
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="text-xs tracking-tight text-text-secondary">
                  {bot._count?.conversations || 0} conversations
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs tracking-tight text-text-secondary">
                  {bot.messageCount || 0} messages
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
                <Clock className="w-3 h-3" />
                Created {formatDistanceToNow(new Date(bot.createdAt))} ago
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-text-tertiary hover:text-brand hover:bg-brand-light rounded-lg transition-all">
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button className="p-2 text-text-tertiary hover:text-brand hover:bg-brand-light rounded-lg transition-all">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Create Card */}
        <button
          onClick={() => navigate("/bots/new")}
          className="bg-card rounded-[32px] border-2 border-dashed border-border p-8 flex flex-col items-center justify-center gap-6 group hover:border-brand/40 hover:bg-brand-light/30 transition-all duration-500 min-h-[300px]"
        >
          <div className="w-16 h-16 rounded-3xl bg-bg-secondary flex items-center justify-center group-hover:bg-brand-light group-hover:scale-110 transition-all duration-500">
            <Plus className="w-8 h-8 text-text-tertiary group-hover:text-brand" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-black text-card-foreground">
              Create New Bot
            </h3>
            <p className="text-sm text-text-secondary font-medium mt-1">
              Ready for your next AI?
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default BotsPage;
