import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Copy, Check, Code, Globe, Terminal, Info } from 'lucide-react';
import type { Bot } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { toast } from 'sonner';

const EmbedPage: React.FC = () => {
  const { bot } = useOutletContext<{ bot: Bot }>();
  const [copied, setCopied] = useState(false);

  const embedCode = `<script
  src="${window.location.origin}/widget/chatbot.js"
  data-bot-id="${bot.id}"
  data-api-url="${import.meta.env.VITE_API_URL}"
  crossorigin
  async
></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success('Embed code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Embed Your Bot</h2>
          <p className="text-gray-500 text-sm font-medium">Add your AI assistant to any website with a single line of code.</p>
        </div>
        <Badge variant={bot.status === 'ready' ? 'ready' : 'error'}>
          {bot.status === 'ready' ? 'Ready for Deployment' : 'Training Required'}
        </Badge>
      </div>

      {bot.status !== 'ready' && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-4">
          <Info className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <p className="text-sm font-bold text-blue-900">Bot is not ready yet</p>
            <p className="text-xs text-blue-700 font-medium">You can still copy the code, but the widget will show an "Untrained" message until training is complete.</p>
          </div>
        </div>
      )}

      {/* Primary Script Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <Terminal className="w-4 h-4" />
          <h3 className="text-sm font-bold uppercase tracking-widest">Installation</h3>
        </div>
        <Card className="p-0 overflow-hidden border-2 border-gray-100">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <span className="w-3 h-3 rounded-full bg-red-400"></span>
               <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
               <span className="w-3 h-3 rounded-full bg-green-400"></span>
               <span className="text-xs font-bold text-gray-400 ml-2 uppercase tracking-widest">HTML Script Tag</span>
            </div>
            <Button size="sm" variant="ghost" className="h-8 gap-1" onClick={handleCopy}>
               {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
               {copied ? 'Copied' : 'Copy Code'}
            </Button>
          </div>
          <div className="bg-gray-900 p-6 font-mono text-sm overflow-x-auto text-blue-300">
             <pre><code>{embedCode}</code></pre>
          </div>
          <div className="p-4 bg-gray-50/50 border-t border-gray-100">
             <p className="text-xs text-gray-500 font-medium italic">
                Tip: Paste this script tag at the bottom of your HTML body, right before the {`</body>`} tag.
             </p>
          </div>
        </Card>
      </section>

      {/* Integration Guides */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <Globe className="w-4 h-4" />
          <h3 className="text-sm font-bold uppercase tracking-widest">Platform Guides</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { name: 'Plain HTML', text: 'Works on any static site or custom CMS. Just paste the script tag.' },
            { name: 'Wordpress', text: 'Use a plugin like "Insert Headers and Footers" or edit your footer.php file.' },
            { name: 'Webflow', text: 'Paste into the "Before </body> tag" section of your site settings.' },
            { name: 'Framer / Shopify', text: 'Add a custom code block or app embed and paste the script.' },
          ].map((guide) => (
            <Card key={guide.name} className="p-4 space-y-2 hover:border-gray-200 transition-colors">
               <h4 className="text-sm font-bold text-gray-900">{guide.name}</h4>
               <p className="text-xs text-gray-500 font-medium leading-relaxed">{guide.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Live Integration Check */}
      <section className="space-y-4">
         <div className="flex items-center gap-2 text-gray-400 mb-2">
          <Code className="w-4 h-4" />
          <h3 className="text-sm font-bold uppercase tracking-widest">Live Integration Check</h3>
        </div>
        <Card className="h-48 flex flex-col items-center justify-center border-dashed border-2 text-center bg-gray-50/10">
           <Code className="w-10 h-10 text-gray-200 mb-4" />
           <p className="text-sm font-bold text-gray-900 mb-1">Testing is easier with the preview tool</p>
           <p className="text-xs text-gray-400 max-w-sm">Use the preview in the Overview tab to test logic. Use this script for production environments.</p>
        </Card>
      </section>
    </div>
  );
};

export default EmbedPage;
