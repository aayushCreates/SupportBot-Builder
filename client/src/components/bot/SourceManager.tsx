import React, { useState } from 'react';
import { Plus, UploadCloud } from 'lucide-react';
import { cn } from '../../utils/helpers';
import Button from '../ui/Button';
import Input, { Textarea } from '../ui/Input';

export interface SourceDraft {
  id: string;
  type: 'pdf' | 'url' | 'text';
  name: string;
  content?: string;
  url?: string;
  file?: File;
}

interface SourceManagerProps {
  onAdd: (source: SourceDraft) => void;
}

const SourceManager: React.FC<SourceManagerProps> = ({ onAdd }) => {
  const [activeTab, setActiveTab] = useState<'pdf' | 'url' | 'text'>('pdf');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState({ name: '', content: '' });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
        {['pdf', 'url', 'text'].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t as any)}
            className={cn(
              "flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
              activeTab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="min-h-[200px] flex flex-col justify-center">
        {activeTab === 'pdf' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 border-dashed">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <input 
                type="file" 
                id="pdf-upload-manager" 
                accept=".pdf" 
                hidden 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onAdd({ id: Math.random().toString(), type: 'pdf', name: file.name, file });
                }}
              />
              <label htmlFor="pdf-upload-manager" className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all px-5 py-2.5 text-sm border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 ring-offset-white focus:ring-gray-300">
                Click to select PDF
              </label>
              <p className="text-xs text-gray-400 mt-2 font-medium">Max file size: 5MB</p>
            </div>
          </div>
        )}

        {activeTab === 'url' && (
          <div className="space-y-4">
            <Input 
              label="Website URL" 
              placeholder="https://docs.acme.com" 
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => {
                if (urlInput) {
                  onAdd({ id: Math.random().toString(), type: 'url', name: urlInput, url: urlInput });
                  setUrlInput('');
                }
              }}
              disabled={!urlInput}
            >
              <Plus className="w-4 h-4" />
              Add URL to Scrape
            </Button>
          </div>
        )}

        {activeTab === 'text' && (
          <div className="space-y-4">
            <Input 
              label="Knowledge Title" 
              placeholder="FAQ or Product Info" 
              value={textInput.name}
              onChange={(e) => setTextInput({...textInput, name: e.target.value})}
            />
            <Textarea 
              label="Paste Content" 
              placeholder="The AI will learn from this text..." 
              value={textInput.content}
              onChange={(e) => setTextInput({...textInput, content: e.target.value})}
            />
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => {
                if (textInput.name && textInput.content) {
                  onAdd({ id: Math.random().toString(), type: 'text', ...textInput });
                  setTextInput({ name: '', content: '' });
                }
              }}
              disabled={!textInput.name || !textInput.content}
            >
              <Plus className="w-4 h-4" />
              Add Document
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SourceManager;
