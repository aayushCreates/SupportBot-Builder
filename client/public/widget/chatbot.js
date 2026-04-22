(function () {
  "use strict";

  /**
   * SUPPORTBOT WIDGET
   * A lightweight, customizable chatbot widget for SupportBot.
   */

  const DEFAULTS = {
    NAME: "Support AI",
    PRIMARY_COLOR: "#5D7FF2",
    WELCOME: "Hi! How can I help you today?",
    PLACEHOLDER: "Type a message...",
    API_BASE: "/api",
  };

  class SupportBot {
    constructor() {
      this.config = null;
      this.botId = null;
      this.apiUrl = null;
      this.sessionId = null;
      this.messages = [];
      this.isOpen = false;
      this.isTyping = false;

      // DOM References
      this.container = null;
      this.shadow = null;
      this.elements = {};

      this.bootstrap();
    }

    // INITIALIZATION & SETUP

    async bootstrap() {
      try {
        this.extractConfiguration();
        if (!this.botId) return;

        await this.fetchConfiguration();
        this.initializeSession();
        // this.loadMessageHistory();
        this.renderWidget();
      } catch (error) {
        console.error("SupportBot: Bootstrap failed", error);
      }
    }

    extractConfiguration() {
      const script =
        document.currentScript || document.querySelector("script[data-bot-id]");

      if (!script) {
        console.error(
          "SupportBot: Script tag not found. Please ensure data-bot-id is set.",
        );
        return;
      }

      this.botId = script.getAttribute("data-bot-id");
      const scriptUrl = new URL(script.src);
      this.apiUrl =
        script.getAttribute("data-api-url") ||
        `${scriptUrl.origin}${DEFAULTS.API_BASE}`;

      if (!this.botId) {
        console.error("SupportBot: Missing data-bot-id attribute.");
      }
    }

    async fetchConfiguration() {
      try {
        const response = await fetch(
          `${this.apiUrl}/widget/${this.botId}/config`,
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        this.config = await response.json();
      } catch (error) {
        console.warn("SupportBot: Using fallback config.", error.message);
        this.config = {
          name: DEFAULTS.NAME,
          primaryColor: DEFAULTS.PRIMARY_COLOR,
          welcomeMessage: DEFAULTS.WELCOME,
          placeholder: DEFAULTS.PLACEHOLDER,
        };
      }
    }

    initializeSession() {
      const key = `sb_session_${this.botId}`;
      this.sessionId = localStorage.getItem(key) || crypto.randomUUID();
      localStorage.setItem(key, this.sessionId);
    }

    loadMessageHistory() {
      const key = `sb_history_${this.botId}`;
      const saved = localStorage.getItem(key);

      if (saved) {
        this.messages = JSON.parse(saved);
      } else {
        this.messages = [
          {
            role: "assistant",
            content: this.config.welcomeMessage,
            id: "welcome",
          },
        ];
      }
    }

    saveMessageHistory() {
      const key = `sb_history_${this.botId}`;
      localStorage.setItem(key, JSON.stringify(this.messages.slice(-20)));
    }

    // RENDERING & UI

    renderWidget() {
      // Create container and shadow DOM
      this.container = document.createElement("div");
      this.container.id = "supportbot-widget-root";
      this.shadow = this.container.attachShadow({ mode: "open" });

      this.injectStyles();
      this.buildInterface();

      document.body.appendChild(this.container);
      this.renderMessages();
    }

    injectStyles() {
      const style = document.createElement("style");
      style.textContent = `
                :host {
                    --sb-primary: ${this.config.primaryColor};
                    --sb-bg: #f8fafc;
                    --sb-text: #0f172a;
                    --sb-text-muted: #64748b;
                    --sb-radius-lg: 24px;
                    --sb-radius-md: 16px;
                    --sb-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
                    --sb-shadow-lg: 0 25px 50px -12px rgb(0 0 0 / 0.25);
                }

                .launcher {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    width: 64px;
                    height: 64px;
                    border-radius: 20px;
                    background: var(--sb-primary);
                    box-shadow: var(--sb-shadow);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 999999;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .launcher:hover {
                    transform: scale(1.08) rotate(5deg);
                    box-shadow: 0 20px 25px -5px var(--sb-primary), 0 8px 10px -6px var(--sb-primary);
                }

                .launcher svg {
                    width: 28px;
                    height: 28px;
                    color: white;
                    transition: transform 0.3s ease;
                }

                .launcher.open svg {
                    transform: rotate(90deg) scale(0.8);
                }

                .window {
                    position: fixed;
                    bottom: 104px;
                    right: 24px;
                    width: 420px;
                    height: 650px;
                    max-height: calc(100vh - 140px);
                    max-width: calc(100vw - 48px);
                    background: white;
                    border-radius: var(--sb-radius-lg);
                    box-shadow: var(--sb-shadow-lg);
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    z-index: 999999;
                    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    font-family: Inter, -apple-system, sans-serif;
                }

                .window.open { display: flex; }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(40px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                .header {
                    padding: 24px;
                    background: var(--sb-primary);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .header-info h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 800;
                    letter-spacing: -0.025em;
                }

                .header-status {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    opacity: 0.9;
                    margin-top: 2px;
                }

                .status-dot {
                    width: 6px;
                    height: 6px;
                    background: #4ade80;
                    border-radius: 50%;
                    box-shadow: 0 0 8px #4ade80;
                }

                .close-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.15);
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .close-btn:hover { background: rgba(255, 255, 255, 0.25); }

                .messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    background: var(--sb-bg);
                    scroll-behavior: smooth;
                }

                /* Scrollbar styling */
                .messages::-webkit-scrollbar { width: 6px; }
                .messages::-webkit-scrollbar-track { background: transparent; }
                .messages::-webkit-scrollbar-thumb { 
                    background: #e2e8f0; 
                    border-radius: 10px;
                }

                .message {
                    max-width: 85%;
                    padding: 12px 18px;
                    border-radius: 18px;
                    font-size: 14px;
                    line-height: 1.6;
                    position: relative;
                    animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .message-user {
                    align-self: flex-end;
                    background: var(--sb-primary);
                    color: white;
                    border-bottom-right-radius: 4px;
                    font-weight: 500;
                }

                .message-assistant {
                    align-self: flex-start;
                    background: white;
                    color: var(--sb-text);
                    border-bottom-left-radius: 4px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                    border: 1px solid rgba(0,0,0,0.05);
                }

                .typing-indicator {
                    padding: 4px 24px;
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--sb-text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    display: none;
                    background: var(--sb-bg);
                }

                .typing-indicator.active { display: block; }

                .input-area {
                    padding: 20px;
                    background: white;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    gap: 12px;
                }

                .input-field {
                    flex: 1;
                    padding: 12px 16px;
                    border: 2px solid #f1f5f9;
                    border-radius: 14px;
                    font-size: 14px;
                    outline: none;
                    transition: all 0.2s;
                    font-family: inherit;
                }

                .input-field:focus {
                    border-color: var(--sb-primary);
                    background: #fff;
                    box-shadow: 0 0 0 4px rgba(93, 127, 242, 0.1);
                }

                .send-btn {
                    width: 48px;
                    height: 48px;
                    border-radius: 14px;
                    background: var(--sb-primary);
                    color: white;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .send-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(93, 127, 242, 0.3);
                }

                .send-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .footer {
                    padding: 12px;
                    text-align: center;
                    background: var(--sb-bg);
                    border-top: 1px solid #f1f5f9;
                }

                .footer-brand {
                    font-size: 10px;
                    font-weight: 800;
                    color: var(--sb-text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    text-decoration: none;
                    opacity: 0.6;
                    transition: opacity 0.2s;
                }

                .footer-brand:hover { opacity: 1; }
            `;
      this.shadow.appendChild(style);
    }

    buildInterface() {
      // Launcher
      const launcher = document.createElement("div");
      launcher.className = "launcher";
      launcher.innerHTML = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>`;
      launcher.addEventListener("click", () => this.toggle());

      // Window
      const windowEl = document.createElement("div");
      windowEl.className = "window";
      windowEl.innerHTML = `
                <div class="header">
                    <div class="header-info">
                        <h3>${this.config.name}</h3>
                        <div class="header-status">
                            <span class="status-dot"></span>
                            <span>Online & Ready to Help</span>
                        </div>
                    </div>
                    <div class="close-btn">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                    </div>
                </div>
                <div class="messages"></div>
                <div class="typing-indicator">Assistant is thinking...</div>
                <div class="input-area">
                    <input type="text" class="input-field" placeholder="${this.config.placeholder}" autocomplete="off">
                    <button class="send-btn" title="Send message">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </button>
                </div>
                <div class="footer">
                    <a href="https://supportbot.ai" target="_blank" class="footer-brand">Powered by SupportBot</a>
                </div>
            `;

      // DOM Event Listeners
      windowEl
        .querySelector(".close-btn")
        .addEventListener("click", () => this.toggle());

      const input = windowEl.querySelector(".input-field");
      const sendBtn = windowEl.querySelector(".send-btn");

      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.handleSendMessage();
      });

      sendBtn.addEventListener("click", () => this.handleSendMessage());

      // Store References
      this.elements = {
        launcher,
        window: windowEl,
        messages: windowEl.querySelector(".messages"),
        input,
        sendBtn,
        typing: windowEl.querySelector(".typing-indicator"),
      };

      this.shadow.appendChild(launcher);
      this.shadow.appendChild(windowEl);
    }

    /**
     * INTERACTION LOGIC
     */

    toggle() {
      this.isOpen = !this.isOpen;
      this.elements.window.classList.toggle("open", this.isOpen);
      this.elements.launcher.classList.toggle("open", this.isOpen);

      if (this.isOpen) {
        this.elements.input.focus();
        this.scrollToBottom();
      }
    }

    renderMessages() {
      this.elements.messages.innerHTML = "";
      this.messages.forEach((msg) => this.appendMessageDOM(msg));
      this.scrollToBottom();
    }

    appendMessageDOM(msg) {
      const div = document.createElement("div");
      div.className = `message message-${msg.role}`;
      div.textContent = msg.content;
      this.elements.messages.appendChild(div);
      return div;
    }

    scrollToBottom() {
      this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }

    async handleSendMessage() {
      const text = this.elements.input.value.trim();
      if (!text || this.isTyping) return;

      // Clear & Disable UI
      this.elements.input.value = "";
      this.setLoadingState(true);

      // 1. Add User Message
      const userMsg = {
        role: "user",
        content: text,
        id: Date.now().toString(),
      };
      this.messages.push(userMsg);
      this.appendMessageDOM(userMsg);
      this.scrollToBottom();

      // 2. Prepare Assistant Message (Streaming)
      const botMsg = {
        role: "assistant",
        content: "",
        id: "temp-" + Date.now(),
      };
      this.messages.push(botMsg);
      const botMsgEl = this.appendMessageDOM(botMsg);
      this.scrollToBottom();

      try {
        await this.executeStreamingChat(text, botMsg, botMsgEl);
      } catch (error) {
        console.error("SupportBot: Chat failed", error);
        botMsgEl.textContent =
          "I apologize, but I encountered an error. Please try again later.";
      } finally {
        this.setLoadingState(false);
        this.saveMessageHistory();
      }
    }

    setLoadingState(isLoading) {
      this.isTyping = isLoading;
      this.elements.input.disabled = isLoading;
      this.elements.sendBtn.disabled = isLoading;
      this.elements.typing.classList.toggle("active", isLoading);
      if (!isLoading) this.elements.input.focus();
    }

    async executeStreamingChat(text, botMsg, botMsgEl) {
      const response = await fetch(`${this.apiUrl}/chat/${this.botId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          sessionId: this.sessionId,
          history: this.messages
            .slice(-10)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error(`Server returned ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;

          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              accumulatedText += parsed.text;
              botMsg.content = accumulatedText;
              botMsgEl.textContent = accumulatedText;
              this.scrollToBottom();
            }
          } catch (e) {
            // Ignore parse errors for partial chunks
          }
        }
      }
    }
  }

  // Initialize Widget
  const init = () => new SupportBot();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
