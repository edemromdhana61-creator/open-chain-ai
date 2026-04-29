import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';

interface ChatMessage {
  id: string;
  from: string;
  content: string;
  timestamp: Date;
  isAgent: boolean;
}

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    from: 'User',
    content: 'Hey, wie läuft der Task?',
    timestamp: new Date(),
    isAgent: false,
  },
  {
    id: '2',
    from: 'OpenClaw',
    content: 'Ich habe die API Schema Design fertig. Brauche Review.',
    timestamp: new Date(),
    isAgent: true,
  },
];

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      from: 'User',
      content: input,
      timestamp: new Date(),
      isAgent: false,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');

    // Simulate agent response
    setTimeout(() => {
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        from: 'OpenClaw',
        content: 'Verstanden. Ich arbeite daran.',
        timestamp: new Date(),
        isAgent: true,
      };
      setMessages((prev) => [...prev, response]);
    }, 1000);
  };

  return (
    <div className="flex h-[400px] flex-col rounded-xl border border-gray-800 bg-gray-900/50">
      <div className="border-b border-gray-800 p-4">
        <h2 className="font-semibold">Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.isAgent ? '' : 'flex-row-reverse'}`}
          >
            <div
              className={`rounded-full p-2 ${
                msg.isAgent
                  ? 'bg-emerald-400/10'
                  : 'bg-blue-400/10'
              }`}
            >
              {msg.isAgent ? (
                <Bot className="h-4 w-4 text-emerald-400" />
              ) : (
                <User className="h-4 w-4 text-blue-400" />
              )}
            </div>

            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.isAgent
                  ? 'bg-gray-800'
                  : 'bg-blue-400/10'
              }`}
            >
              <p className="text-sm font-medium text-gray-300">{msg.from}</p>
              <p className="mt-1 text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="border-t border-gray-800 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Nachricht eingeben..."
            className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-emerald-400 focus:outline-none"
          />
          <button
            onClick={sendMessage}
            className="rounded-lg bg-emerald-400 p-2 text-gray-900 hover:bg-emerald-500"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
