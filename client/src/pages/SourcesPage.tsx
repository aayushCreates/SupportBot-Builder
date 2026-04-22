import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Database, FileText, Globe, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import type { Bot } from '../types';
import { useSources } from '../hooks/useSources';
import { useBots } from '../hooks/useBots';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import SourceManager from '../components/bot/SourceManager';
import type { SourceDraft } from '../components/bot/SourceManager';
import { toast } from 'sonner';

const SourcesPage: React.FC = () => {
  const { bot } = useOutletContext<{ bot: Bot }>();
  const { useSourcesQuery, addSourceMutation, deleteSourceMutation } = useSources(bot.id);
  const { trainBotMutation } = useBots();
  const { data: sources, isLoading } = useSourcesQuery();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleAddSource = async (draft: SourceDraft) => {
    try {
      await addSourceMutation.mutateAsync(draft);
      toast.success('Source added successfully');
      setIsAddModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add source');
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    try {
      setIsDeleting(sourceId);
      await deleteSourceMutation.mutateAsync(sourceId);
      toast.success('Source deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete source');
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) return <Spinner size="lg" className="h-64" />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Knowledge Base</h2>
          <p className="text-gray-500 text-sm font-medium">Manage the documents and URLs your bot learns from.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Source
        </Button>
      </div>

      {bot.status === 'untrained' && sources && sources.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 shrink-0">
               <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Training pending</p>
              <p className="text-xs text-gray-600 font-medium">You've added or removed sources. Retrain your bot to apply changes.</p>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="primary" 
            className="bg-yellow-600 hover:bg-yellow-700 shadow-yellow-100"
            isLoading={trainBotMutation.isPending}
            onClick={() => trainBotMutation.mutate(bot.id)}
          >
            <RefreshCw className="w-4 h-4" />
            Retrain Now
          </Button>
        </div>
      )}

      <div className="grid gap-4">
        {sources?.length === 0 ? (
          <Card className="h-64 flex flex-col items-center justify-center border-dashed border-2 text-center bg-gray-50/30">
            <Database className="w-12 h-12 text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No sources yet</h3>
            <p className="text-sm text-gray-400 max-w-xs mb-6">Start by uploading a PDF, scraping a website, or pasting some text.</p>
            <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>
               Add your first source
            </Button>
          </Card>
        ) : (
          sources?.map((source) => (
            <Card key={source.id} className="p-4 flex items-center justify-between transition-all hover:bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                   {source.type === 'pdf' ? <FileText className="w-6 h-6" /> : source.type === 'url' ? <Globe className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900">{source.name}</p>
                    <Badge variant={source.status as any}>{source.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>{source.type}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                    <span>{source.chunkCount || 0} chunks</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleDeleteSource(source.id)}
                disabled={isDeleting === source.id}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                {isDeleting === source.id ? <RefreshCw className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </Card>
          ))
        )}
      </div>

      {/* Add Source Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Knowledge Source"
        maxWidth="lg"
      >
        <SourceManager onAdd={handleAddSource} />
      </Modal>
    </div>
  );
};

export default SourcesPage;
