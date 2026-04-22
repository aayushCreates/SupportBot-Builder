import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Settings, Palette, Zap, Trash2, Bot as BotIcon, AlertTriangle, Save, MessageSquare } from 'lucide-react';
import type { Bot } from '../types';
import { useBots } from '../hooks/useBots';
import Button from '../components/ui/Button';
import Input, { Textarea } from '../components/ui/Input';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { toast } from 'sonner';
import Card from '../components/ui/Card';

const SettingsPage: React.FC = () => {
  const { bot } = useOutletContext<{ bot: Bot }>();
  const { updateBotMutation, deleteBotMutation } = useBots();
  
  const [formData, setFormData] = useState({
    name: bot.name,
    description: bot.description || '',
    systemPrompt: bot.systemPrompt,
    welcomeMessage: bot.welcomeMessage,
    placeholder: bot.placeholder,
    primaryColor: bot.primaryColor,
  });

  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleUpdate = async (section: string) => {
    try {
      await updateBotMutation.mutateAsync({
        botId: bot.id,
        ...formData
      });
      toast.success(`${section} updated successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Update failed');
    }
  };

  const handleDeleteBot = async () => {
    try {
      setIsDeleting(true);
      await deleteBotMutation.mutateAsync(bot.id);
      toast.success('Bot deleted successfully');
      setIsDeleteModalOpen(false);
      window.location.href = '/dashboard';
    } catch (error: any) {
      toast.error(error.message || 'Deletion failed');
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* 1. General Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <Settings className="w-4 h-4" />
          <h3 className="text-sm font-bold uppercase tracking-widest">General Identity</h3>
        </div>
        <Card className="max-w-3xl space-y-6">
          <Input 
            label="Bot Name" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <Textarea 
            label="Internal Description" 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            helperText="Not visible to your customers."
          />
          <div className="pt-4 border-t border-gray-50 flex justify-end">
            <Button 
              size="sm" 
              onClick={() => handleUpdate('Identity')}
              isLoading={updateBotMutation.isPending && updateBotMutation.variables?.name !== undefined}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </Card>
      </section>

      {/* 2. AI behavior Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <Zap className="w-4 h-4" />
          <h3 className="text-sm font-bold uppercase tracking-widest">AI Intelligence</h3>
        </div>
        <Card className="max-w-3xl space-y-6">
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex gap-4">
             <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0" />
             <p className="text-xs text-blue-700 font-medium leading-relaxed">
                Changes to the system prompt will take effect immediately, but your bot may need retraining if you change its core personality or knowledge constraints.
             </p>
          </div>
          <Textarea 
            label="System Prompt" 
            className="min-h-[150px] font-mono text-xs"
            value={formData.systemPrompt}
            onChange={(e) => setFormData({...formData, systemPrompt: e.target.value})}
            helperText="Guidelines the AI follows. Example: 'You are a professional support agent for Acme Corp...'"
          />
          <div className="pt-4 border-t border-gray-50 flex justify-end">
            <Button 
              size="sm" 
              onClick={() => handleUpdate('Intelligence')}
              isLoading={updateBotMutation.isPending && updateBotMutation.variables?.systemPrompt !== undefined}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </Card>
      </section>

      {/* 3. Appearance Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <Palette className="w-4 h-4" />
          <h3 className="text-sm font-bold uppercase tracking-widest">Interface & Style</h3>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <Card className="space-y-6">
            <Input 
              label="Welcome Message" 
              value={formData.welcomeMessage}
              onChange={(e) => setFormData({...formData, welcomeMessage: e.target.value})}
            />
            <Input 
              label="Input Placeholder" 
              value={formData.placeholder}
              onChange={(e) => setFormData({...formData, placeholder: e.target.value})}
            />
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Theme Color</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  className="w-12 h-12 rounded-xl cursor-pointer border-4 border-gray-100 p-0"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                />
                <Input 
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                  className="flex-1 font-mono uppercase"
                />
              </div>
            </div>
            <div className="pt-4 border-t border-gray-50 flex justify-end">
              <Button 
                size="sm" 
                onClick={() => handleUpdate('Appearance')}
                isLoading={updateBotMutation.isPending && updateBotMutation.variables?.primaryColor !== undefined}
              >
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </Card>

          {/* Live Preview */}
          <div className="sticky top-8">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-4 block">Widget Design Preview</span>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl h-[400px] flex flex-col overflow-hidden max-w-sm mx-auto">
               <div style={{ backgroundColor: formData.primaryColor }} className="p-4 flex items-center justify-between text-white">
                  <span className="font-bold flex items-center gap-2">
                     <BotIcon className="w-4 h-4" />
                     {formData.name || 'ChatBot'}
                  </span>
               </div>
               <div className="flex-1 bg-gray-50/50 p-4 space-y-4 flex flex-col h-full overflow-hidden">
                  <div className="flex items-start gap-2">
                     <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400"><BotIcon className="w-4 h-4" /></div>
                     <div className="bg-white p-3 rounded-2xl rounded-tl-none text-[11px] text-gray-700 max-w-[85%] shadow-sm border border-gray-100 font-medium">
                        {formData.welcomeMessage}
                     </div>
                  </div>
               </div>
               <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
                  <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 flex items-center text-[10px] text-gray-400">
                     {formData.placeholder}
                  </div>
                  <div style={{ backgroundColor: formData.primaryColor }} className="w-10 h-10 rounded-xl flex items-center justify-center text-white opacity-40">
                    <MessageSquare className="w-4 h-4" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Danger Zone */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-red-400 mb-2">
          <AlertTriangle className="w-4 h-4" />
          <h3 className="text-sm font-bold uppercase tracking-widest">Danger Zone</h3>
        </div>
        <Card className="max-w-3xl border-red-100 bg-red-50/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-sm font-bold text-gray-900">Delete this bot</p>
              <p className="text-xs text-gray-500 font-medium">Once you delete a bot, there is no going back. Please be certain.</p>
            </div>
            <Button 
               variant="danger" 
               className="bg-red-600 text-white hover:bg-red-700 shadow-red-100 shrink-0"
               onClick={() => setIsDeleteModalOpen(true)}
            >
              <Trash2 className="w-4 h-4" />
              Delete Bot
            </Button>
          </div>
        </Card>
      </section>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteBot}
        title="Delete Bot"
        message="Deleting this bot will remove all of its data, including trained sources, conversation history, and its custom configuration. This cannot be undone."
        confirmText="Delete Permanently"
        confirmMatchText={bot.name}
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
};

export default SettingsPage;
