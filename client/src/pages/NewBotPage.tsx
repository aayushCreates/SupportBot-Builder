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
  Bot,
  ChevronLeft,
  X,
  Send,
} from "lucide-react";
import { useBots } from "../hooks/useBots";
import axiosInstance from "../api/axios";
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
    inputPlaceholder: "Ask me anything...",
    primaryColor: "#6366F1", // Indigo default
  });

  const [sources, setSources] = useState<SourceDraft[]>([]);
  const [activeSourceTab, setActiveSourceTab] = useState<
    "pdf" | "url" | "text"
  >("pdf");
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState({ name: "", content: "" });

  const steps = [
    { number: 1, label: "Basic Info" },
    { number: 2, label: "Add Content" },
    { number: 3, label: "Appearance" },
  ];

  const handleAddSource = (source: SourceDraft) => {
    setSources([...sources, source]);
    toast.success(`${source.type.toUpperCase()} source added`);
  };

  const handleCreateBot = async () => {
    try {
      setIsSubmitting(true);

      // 1. Create Bot
      const bot = await createBotMutation.mutateAsync({
        name: botData.name,
        description: botData.description,
        welcomeMessage: botData.welcomeMessage,
        primaryColor: botData.primaryColor,
      });

      // 2. Add Sources
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

        await axiosInstance.post(`/bots/${bot.id}/sources`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // 3. Start Training (Optional but recommended at creation)
      if (sources.length > 0) {
        await trainBotMutation.mutateAsync(bot.id);
      }

      toast.success("Bot created successfully!");
      navigate(`/bots/${bot.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create bot");
    } finally {
      setIsSubmitting(false);
    }
  };

  const colorOptions = ["#6366F1", "#8B5CF6", "#10B981", "#F59E0B", "#EC4899"];

  return (
    <div className="max-w-6xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
      {/* Content Container */}
      <div className="bg-white border border-[#E4E4E7] rounded-[32px] p-8 sm:p-4 shadow-sm min-h-[600px] flex flex-col">
        {/* Stepper Container */}
        <div className="mb-6">
          <div className="flex items-center justify-center max-w-2xl mx-auto">
            {steps.map((s, i) => (
              <React.Fragment key={s.number}>
                <div className="flex flex-col items-center gap-2 relative z-10 w-24">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-semibold transition-all duration-300",
                      step === s.number
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                        : step > s.number
                          ? "bg-blue-400 text-white"
                          : "bg-[#F4F4F5] text-[#71717A]",
                    )}
                  >
                    {step > s.number ? <Check className="w-5 h-5" /> : s.number}
                  </div>
                  <span
                    className={cn(
                      "text-[12px] font-semibold tracking-tight whitespace-nowrap",
                      step >= s.number ? "text-[#0A0A0A]" : "text-[#A1A1AA]",
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-[2px] bg-[#E4E4E7] -mt-6">
                    <div
                      className={cn(
                        "h-full bg-blue-600 transition-all duration-500",
                        step > s.number ? "w-full" : "w-0",
                      )}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        {step === 1 && (
          <div className="flex-1 flex flex-col max-w-xl mx-auto w-full pt-8">
            <div className="mb-10 text-center sm:text-left">
              <h1 className="text-[25px] font-semibold text-[#0A0A0A] mb-2">
                Information about the bot
              </h1>
              <p className="text-[#71717A] text-[12px] font-medium">
                This will help you identify it in your dashboard.
              </p>
            </div>

            <div className="space-y-8 flex-1">
              <div className="space-y-2">
                <label className="text-[14px] font-semibold text-[#0A0A0A]">
                  Bot Name *
                </label>
                <input
                  type="text"
                  placeholder="Acme Support Assistant"
                  value={botData.name}
                  onChange={(e) =>
                    setBotData({ ...botData, name: e.target.value })
                  }
                  className="w-full bg-white border border-[#E4E4E7] rounded-md px-4 py-2.5 text-[15px] focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none placeholder:text-[#A1A1AA]"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-[14px] font-semibold text-[#0A0A0A]">
                  Description (optional)
                </label>
                <textarea
                  placeholder="Helps customers with product questions..."
                  value={botData.description}
                  onChange={(e) =>
                    setBotData({ ...botData, description: e.target.value })
                  }
                  className="w-full bg-white border border-[#E4E4E7] rounded-md px-4 py-2.5 text-[15px] focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none placeholder:text-[#A1A1AA] min-h-[120px] resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-12 border-t border-[#F4F4F5] mt-auto">
              <button
                onClick={() => navigate("/bots")}
                className="text-[#71717A] font-semibold text-[15px] hover:text-[#0A0A0A] transition-colors border px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!botData.name.trim()}
                className="bg-blue-500 hover:cursor-pointer disabled:opacity-50 text-white rounded-md px-6 py-2 font-semibold flex items-center gap-2 transition-all"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full pt-8">
            <div className="flex justify-between">
              <div className="mb-10">
                <h1 className="text-[28px] font-semibold text-[#0A0A0A] mb-2">
                  Add your knowledge base
                </h1>
                <p className="text-[#71717A] text-[12px] font-medium">
                  Upload documents, paste URLs, or add text. You can add more
                  later.
                </p>
              </div>

              <div className="space-y-8">
                {/* Tab Switcher */}
                <div className="flex p-1.5 bg-[#F4F4F5] rounded-lg w-fit">
                  {(["pdf", "url", "text"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveSourceTab(tab)}
                      className={cn(
                        "px-8 py-2.5 rounded-lg text-[13px] font-semibold transition-all",
                        activeSourceTab === tab
                          ? "bg-white text-[#0A0A0A] shadow-sm"
                          : "text-[#71717A] hover:text-[#0A0A0A]",
                      )}
                    >
                      {tab.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1">
              {/* Source Content Area */}
              <div className="min-h-[300px]">
                {activeSourceTab === "pdf" && (
                  <div className="border-2 border-dashed border-[#E4E4E7] rounded-[32px] p-12 bg-[#FAFAF9] flex flex-col items-center justify-center group transition-all hover:bg-white hover:border-blue-600/30">
                    <label className="cursor-pointer flex flex-col items-center gap-4 w-full">
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
                      <div className="w-16 h-16 rounded-2xl bg-white border border-[#E4E4E7] flex items-center justify-center text-[#A1A1AA] shadow-sm group-hover:scale-110 transition-all">
                        <Upload className="w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <p className="text-[18px] font-semibold text-[#0A0A0A]">
                          Drag and drop PDF here
                        </p>
                        <p className="text-[12px] text-[#71717A] font-medium mt-1">
                          or click to browse (max 5MB on Free plan)
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {activeSourceTab === "url" && (
                  <div className="w-full space-y-6 pt-4">
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold text-[#0A0A0A]">
                        Website URL
                      </label>
                      <div className="relative mt-1">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]">
                          <Globe className="w-5 h-5" />
                        </div>
                        <input
                          type="url"
                          placeholder="https://docs.yoursite.com/help"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          className="w-full bg-white border border-[#E4E4E7] rounded-lg pl-12 pr-2 py-2 text-[15px] focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all placeholder:text-[#A1A1AA]"
                        />
                      </div>
                      <p className="text-[11px] text-[#949494] font-medium">
                        We'll extract the main content automatically.
                      </p>
                    </div>

                    <button
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
                      className="bg-blue-500 text-white px-6 py-2 rounded-md font-semibold hover:cursor-pointer transition-all text-[13px]"
                    >
                      Add URL
                    </button>
                  </div>
                )}

                {activeSourceTab === "text" && (
                  <div className="w-full space-y-6 pt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[14px] font-semibold text-[#0A0A0A]">
                          Source Title
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Return Policy"
                          value={textInput.name}
                          onChange={(e) =>
                            setTextInput({ ...textInput, name: e.target.value })
                          }
                          className="w-full bg-white border border-[#E4E4E7] rounded-md px-4 py-2 text-[15px] focus:ring-2 focus:ring-blue-600/10 outline-nonem mt-1"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[14px] font-semibold text-[#0A0A0A]">
                          Content
                        </label>
                        <textarea
                          placeholder="Paste your knowledge content here..."
                          value={textInput.content}
                          onChange={(e) =>
                            setTextInput({
                              ...textInput,
                              content: e.target.value,
                            })
                          }
                          className="w-full bg-white border border-[#E4E4E7] rounded-md px-4 py-2 text-[15px] focus:ring-2 focus:ring-blue-600/10 outline-none min-h-[100px] mt-1"
                        />
                      </div>
                    </div>
                    <button
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
                      className="bg-blue-500 text-white px-6 py-2 rounded-md font-semibold hover:cursor-pointer transition-all text-[14px]"
                    >
                      Add Text
                    </button>
                  </div>
                )}
              </div>

              {/* Added Sources Chips */}
              {sources.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4">
                  {sources.map((s) => (
                    <div
                      key={s.id}
                      className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2 text-[12px] font-semibold text-blue-700"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {s.name}
                      <button
                        onClick={() =>
                          setSources(sources.filter((x) => x.id !== s.id))
                        }
                        className="hover:text-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-12 border-t border-[#F4F4F5] mt-auto">
              <button
                onClick={() => setStep(1)}
                className="text-[#71717A] font-semibold text-[15px] flex items-center gap-2 hover:text-[#0A0A0A]"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <div className="flex items-center">
                <button
                  onClick={() => setStep(3)}
                  className="bg-blue-500 hover:cursor-pointer disabled:opacity-50 text-white rounded-md px-6 py-2 font-semibold flex items-center gap-2 transition-all"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full pt-8">
            <div className="mb-10">
              <h1 className="text-[32px] font-semibold text-[#0A0A0A] mb-2">
                Customize your bot
              </h1>
            </div>

            <div className="flex justify-between w-full gap-10">
              <div className="flex flex-col gap-5 w-1/2">
                <div className="space-y-2">
                  <label className="text-[14px] font-semibold text-[#0A0A0A]">
                    Welcome Message
                  </label>
                  <input
                    type="text"
                    value={botData.welcomeMessage}
                    onChange={(e) =>
                      setBotData({ ...botData, welcomeMessage: e.target.value })
                    }
                    className="w-full bg-white border border-[#E4E4E7] rounded-md px-4 py-2 text-[15px] focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none mt-1"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[14px] font-semibold text-[#0A0A0A]">
                    Input Placeholder
                  </label>
                  <input
                    type="text"
                    value={botData.inputPlaceholder}
                    onChange={(e) =>
                      setBotData({
                        ...botData,
                        inputPlaceholder: e.target.value,
                      })
                    }
                    className="w-full bg-white border border-[#E4E4E7] rounded-md px-4 py-2 text-[15px] focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none mt-1"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[14px] font-semibold text-[#0A0A0A]">
                    Primary Color
                  </label>
                  <div className="flex gap-2 mt-3">
                    {colorOptions.map((c) => (
                      <button
                        key={c}
                        onClick={() =>
                          setBotData({ ...botData, primaryColor: c })
                        }
                        className={cn(
                          "w-8 h-8 rounded-full border-4 border-transparent transition-all",
                          botData.primaryColor === c
                            ? "border-white ring-2 ring-blue-600 shadow-lg scale-110"
                            : "",
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Chat Preview */}
              <div className="w-1/2">
                <p className="text-[14px] font-semibold text-[#71717A] mb-2">
                  Preview
                </p>
                <div className="bg-white border border-[#E4E4E7] rounded-[24px] shadow-lg h-[500px] flex flex-col overflow-hidden">
                  <div
                    style={{ backgroundColor: botData.primaryColor }}
                    className="p-5 flex items-center gap-3 text-white shadow-lg transition-colors"
                  >
                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold leading-tight">
                        {botData.name || "d"}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/90">
                          Online
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-[#FAFAF9]">
                    <div className="flex items-start gap-3">
                      <div className="bg-white border border-[#E4E4E7] p-2.5 rounded-[10px] rounded-tl-none shadow-sm text-[13px] font-semibold text-[#555050] max-w-[85%] leading-relaxed">
                        {botData.welcomeMessage
                          ? botData.welcomeMessage
                          : "Hi! How can I help you today?"}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white border-t border-[#F4F4F5] flex gap-3 items-center">
                    <div className="flex-1 h-11 bg-[#ffffff] rounded-lg px-4 flex items-center text-[#71717A] text-[13px] font-medium border">
                      {botData.inputPlaceholder
                        ? botData.inputPlaceholder
                        : "Ask me anything..."}
                    </div>
                    <div
                      style={{ backgroundColor: botData.primaryColor }}
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg opacity-40 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-12 border-t border-[#F4F4F5] mt-auto">
              <button
                onClick={() => setStep(2)}
                className="text-[#71717A] font-semibold text-[15px] flex items-center gap-2 hover:text-[#0A0A0A]"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleCreateBot}
                disabled={isSubmitting}
                className="bg-blue-500 hover:cursor-pointer disabled:opacity-50 text-white rounded-md px-6 py-2 font-semibold flex items-center gap-2 transition-all"
              >
                {isSubmitting ? "Creating..." : "Create Bot"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewBotPage;
