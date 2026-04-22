import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Globe,
  FileText,
  Plus,
  Trash2,
  Upload,
  ArrowRight,
} from "lucide-react";
import { useBots } from "../hooks/useBots";
import { cn } from "../utils/helpers";
import Button from "../components/ui/Button";
import Input, { Textarea } from "../components/ui/Input";
import { toast } from "sonner";

interface SourceDraft {
  id: string;
  type: "pdf" | "url" | "text";
  name: string;
  content?: string;
  url?: string;
  file?: File;
}

const NewBotPage: React.FC = () => {
  const navigate = useNavigate();
  const { createBotMutation, trainBotMutation } = useBots();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [botData, setBotData] = useState({
    name: "",
    description: "",
    welcomeMessage: "Hi! How can I help you today?",
    primaryColor: "#5D7FF2", // Matching the blue in the screenshot
  });

  const [sources, setSources] = useState<SourceDraft[]>([]);
  const [activeSourceTab, setActiveSourceTab] = useState<
    "pdf" | "url" | "text"
  >("pdf");
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState({ name: "", content: "" });

  const steps = [
    { number: 1, label: "Basics" },
    { number: 2, label: "Content" },
    { number: 3, label: "Appearance" },
  ];

  const handleAddSource = (source: SourceDraft) => {
    setSources([...sources, source]);
  };

  const handleCreateBot = async () => {
    try {
      setIsSubmitting(true);

      // 1. Create Bot
      const bot = await createBotMutation.mutateAsync({
        name: botData.name,
        description: botData.description,
      });

      // 2. Add Sources
      const token = await (window as any).Clerk.session.getToken();

      for (const source of sources) {
        const formData = new FormData();
        formData.append("type", source.type);
        if (source.name) formData.append("name", source.name);

        if (source.type === "pdf" && source.file) {
          formData.append("file", source.file);
        } else if (source.type === "url" && source.url) {
          formData.append("url", source.url);
        } else if (source.type === "text" && source.content) {
          formData.append("content", source.content);
        }

        await fetch(`${import.meta.env.VITE_API_URL}/bots/${bot.id}/sources`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      }

      // 3. Start Training
      await trainBotMutation.mutateAsync(bot.id);

      toast.success("Bot created and training started!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to create bot");
    } finally {
      setIsSubmitting(false);
    }
  };

  const colorOptions = ["#5D7FF2", "#10B981", "#EF4444", "#D97706", "#0EA5E9"];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 h-full flex flex-col items-center">
      {/* Stepper */}
      <div className="flex items-center gap-4 mb-16">
        {steps.map((s, i) => (
          <React.Fragment key={s.number}>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  step === s.number
                    ? "bg-primary text-primary-foreground shadow-lg shadow-brand/20"
                    : step > s.number
                      ? "bg-primary text-primary-foreground"
                      : "bg-bg-tertiary text-text-tertiary font-medium",
                )}
              >
                {step > s.number ? <Check className="w-4 h-4" /> : s.number}
              </div>
              <span
                className={cn(
                  "text-sm font-bold tracking-tight",
                  step >= s.number ? "text-foreground" : "text-text-tertiary",
                )}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && <div className="w-12 h-px bg-border" />}
          </React.Fragment>
        ))}
      </div>

      {/* Main Content Card Container */}
      <div className="w-full max-w-2xl bg-card rounded-[32px] p-10 border border-border shadow-sm">
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-3xl font-black text-foreground mb-2">
                Name your bot
              </h2>
              <p className="text-text-secondary font-medium tracking-tight">
                Give your bot a name your customers will see.
              </p>
            </div>

            <div className="space-y-6">
              <Input
                label="Bot name *"
                placeholder="testing"
                value={botData.name}
                onChange={(e) =>
                  setBotData({ ...botData, name: e.target.value })
                }
                autoFocus
              />
              <Textarea
                label="Description"
                placeholder="testing"
                value={botData.description}
                onChange={(e) =>
                  setBotData({ ...botData, description: e.target.value })
                }
                className="min-h-[140px]"
              />
            </div>

            <div className="flex items-center justify-end gap-6 pt-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-text-secondary font-bold hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <Button
                onClick={() => setStep(2)}
                disabled={!botData.name.trim()}
                className="rounded-xl px-10 py-3 shadow-xl shadow-brand/10"
              >
                Continue &rarr;
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
            <div className="text-left">
              <h2 className="text-3xl font-black text-foreground mb-2">
                Add your knowledge base
              </h2>
              <p className="text-text-secondary font-medium tracking-tight">
                Your bot will only answer from this content.
              </p>
            </div>

            {/* Source Tabs */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveSourceTab("pdf")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all border",
                  activeSourceTab === "pdf"
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-brand/20"
                    : "bg-bg-secondary text-text-secondary border-border hover:bg-bg-tertiary",
                )}
              >
                <FileText className="w-4 h-4" /> Upload PDF
              </button>
              <button
                onClick={() => setActiveSourceTab("url")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all border",
                  activeSourceTab === "url"
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-brand/20"
                    : "bg-bg-secondary text-text-secondary border-border hover:bg-bg-tertiary",
                )}
              >
                <Globe className="w-4 h-4" /> Add URL
              </button>
              <button
                onClick={() => setActiveSourceTab("text")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all border",
                  activeSourceTab === "text"
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-brand/20"
                    : "bg-bg-secondary text-text-secondary border-border hover:bg-bg-tertiary",
                )}
              >
                <Plus className="w-4 h-4" /> Paste Text
              </button>
            </div>

            {/* Tab Content */}
            <div className="border-2 border-dashed border-border rounded-[32px] p-12 bg-background flex flex-col items-center justify-center gap-4 group hover:border-brand/40 transition-all min-h-[250px]">
              {activeSourceTab === "pdf" && (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-bg-secondary flex items-center justify-center text-text-tertiary group-hover:bg-brand-light group-hover:text-brand transition-all">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file)
                            handleAddSource({
                              id: Math.random().toString(),
                              type: "pdf",
                              name: file.name,
                              file,
                            });
                        }}
                      />
                      <p className="text-lg font-black text-foreground">
                        Drag & drop a PDF here
                      </p>
                      <p className="text-sm text-text-tertiary font-medium">
                        or click to browse · Max 5MB · PDF only
                      </p>
                    </label>
                  </div>
                  <button className="text-brand text-sm font-bold hover:underline">
                    Add sample PDF
                  </button>
                </>
              )}

              {activeSourceTab === "url" && (
                <div className="w-full max-w-sm space-y-4">
                  <Input
                    placeholder="https://docs.acme.com"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                  <Button
                    variant="secondary"
                    className="w-full py-3"
                    onClick={() => {
                      if (urlInput) {
                        handleAddSource({
                          id: Math.random().toString(),
                          type: "url",
                          name: urlInput,
                          url: urlInput,
                        });
                        setUrlInput("");
                      }
                    }}
                  >
                    Add URL to Scrape
                  </Button>
                </div>
              )}

              {activeSourceTab === "text" && (
                <div className="w-full max-w-md space-y-4">
                  <Input
                    placeholder="Document Title"
                    value={textInput.name}
                    onChange={(e) =>
                      setTextInput({ ...textInput, name: e.target.value })
                    }
                  />
                  <Textarea
                    placeholder="Paste your content here..."
                    value={textInput.content}
                    onChange={(e) =>
                      setTextInput({ ...textInput, content: e.target.value })
                    }
                  />
                  <Button
                    variant="secondary"
                    className="w-full py-3"
                    onClick={() => {
                      if (textInput.name && textInput.content) {
                        handleAddSource({
                          id: Math.random().toString(),
                          type: "text",
                          ...textInput,
                        });
                        setTextInput({ name: "", content: "" });
                      }
                    }}
                  >
                    Add Document
                  </Button>
                </div>
              )}
            </div>

            {/* Added Sources Chips */}
            {sources.length > 0 && (
              <div className="flex flex-wrap gap-2 text-left">
                {sources.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-brand-light text-brand rounded-full text-xs font-black"
                  >
                    <span className="truncate max-w-[150px]">{s.name}</span>
                    <button
                      onClick={() =>
                        setSources(sources.filter((src) => src.id !== s.id))
                      }
                    >
                      <Trash2 className="w-3 h-3 hover:text-danger" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-6">
              <button
                onClick={() => setStep(1)}
                className="text-text-secondary font-bold flex items-center gap-2 hover:text-foreground transition-all"
              >
                &larr; Back
              </button>
              <Button
                onClick={() => setStep(3)}
                className="rounded-xl px-10 py-3 shadow-xl shadow-brand/10"
              >
                Continue &rarr;
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-3xl font-black text-foreground mb-2">
                Customize your bot
              </h2>
              <p className="text-text-secondary font-medium tracking-tight">
                Make it feel like part of your product.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-10">
              <div className="space-y-8">
                <Input
                  label="Welcome message"
                  value={botData.welcomeMessage}
                  onChange={(e) =>
                    setBotData({ ...botData, welcomeMessage: e.target.value })
                  }
                />

                <div className="space-y-4">
                  <label className="text-sm font-bold text-text-secondary ml-1">
                    Brand color
                  </label>
                  <div className="flex items-center gap-3">
                    {colorOptions.map((c) => (
                      <button
                        key={c}
                        onClick={() =>
                          setBotData({ ...botData, primaryColor: c })
                        }
                        className={cn(
                          "w-10 h-10 rounded-full border-4 border-transparent transition-all hover:scale-110 shadow-sm",
                          botData.primaryColor === c
                            ? "border-border ring-2 ring-brand"
                            : "",
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <div className="relative w-10 h-10 rounded-full border-2 border-dashed border-border flex items-center justify-center overflow-hidden hover:border-brand/40">
                      <input
                        type="color"
                        value={botData.primaryColor}
                        onChange={(e) =>
                          setBotData({
                            ...botData,
                            primaryColor: e.target.value,
                          })
                        }
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Plus className="w-4 h-4 text-text-tertiary" />
                    </div>
                  </div>
                </div>

                <div className="pt-10 flex items-center justify-start">
                  <button
                    onClick={() => setStep(2)}
                    className="text-text-secondary font-bold flex items-center gap-2 hover:text-foreground transition-all"
                  >
                    &larr; Back
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-foreground ml-1">
                  Preview
                </h4>
                <div className="bg-bg-tertiary rounded-3xl p-6 border border-border shadow-2xl h-[350px] flex flex-col overflow-hidden relative group">
                  <div
                    style={{ backgroundColor: botData.primaryColor }}
                    className="p-4 flex items-center justify-between text-white rounded-t-2xl"
                  >
                    <span className="font-bold text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                      {botData.name || "testing"}
                    </span>
                  </div>
                  <div className="flex-1 bg-background p-4 space-y-4 overflow-y-auto">
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-lg bg-bg-secondary flex items-center justify-center text-text-tertiary text-[10px] font-bold">
                        {botData.name?.[0].toUpperCase() || "T"}
                      </div>
                      <div className="bg-bg-secondary p-3 rounded-2xl rounded-tl-none text-xs text-foreground max-w-[85%] border border-border uppercase font-bold leading-relaxed px-4">
                        {botData.welcomeMessage}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-background border-t border-border flex gap-2">
                    <div className="flex-1 h-9 bg-bg-secondary rounded-xl" />
                    <div
                      style={{ backgroundColor: botData.primaryColor }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="pt-8 flex justify-end">
                  <Button
                    onClick={handleCreateBot}
                    isLoading={isSubmitting}
                    className="rounded-xl px-10 py-3 shadow-xl shadow-brand/10"
                  >
                    Create Bot
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewBotPage;
