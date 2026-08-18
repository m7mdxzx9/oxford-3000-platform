'use client';

import * as React from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Volume2,
  Mic,
  Languages,
  CheckCircle2,
  Lightbulb,
  Key,
} from 'lucide-react';
import { RoleplayScenario, RoleplayMessage } from '../types';
import { DIALOGUE_TOPICS } from '@/data/dialogueScenarios.js';
import { generateAiRoleplayResponse } from '@/lib/gemini';
import { useStore } from '@/lib/store';
import { AudioEngineService } from '@/features/audio-speech/services/audioService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function AiTutorChat() {
  const [selectedTopicId, setSelectedTopicId] = React.useState('airport');
  const [messages, setMessages] = React.useState<RoleplayMessage[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showArabic, setShowArabic] = React.useState(true);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = React.useState(false);

  const geminiApiKey = useStore((state) => state.geminiApiKey);
  const setGeminiApiKey = useStore((state) => state.setGeminiApiKey);
  const addXp = useStore((state) => state.addXp);
  const audioRate = useStore((state) => state.audioPlaybackRate);

  const currentScenario: RoleplayScenario = React.useMemo(() => {
    const raw = (DIALOGUE_TOPICS as any[]).find((t) => t.id === selectedTopicId) || DIALOGUE_TOPICS[0];
    return {
      id: raw.id,
      title: raw.title,
      arabicTitle: raw.title,
      icon: raw.icon,
      cefr: raw.cefr,
      description: raw.roles?.player2?.goal || 'Practice interactive dialogue',
      userRole: raw.roles?.player1?.name || 'Student',
      tutorRole: raw.roles?.player2?.name || 'Tutor',
      targetWords: raw.targetWords || [],
      starterMessages: (raw.starterTurns || []).map((turn: any, index: number) => ({
        id: `start-${index}`,
        sender: turn.speaker === 'player1' ? 'user' : 'tutor',
        english: turn.english,
        arabic: turn.arabic,
        timestamp: Date.now(),
      })),
    };
  }, [selectedTopicId]);

  // Reset dialogue on scenario switch
  React.useEffect(() => {
    setMessages(currentScenario.starterMessages);
  }, [currentScenario]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');

    const userMsg: RoleplayMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      english: userText,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const response = await generateAiRoleplayResponse(
        currentScenario,
        newHistory,
        userText,
        geminiApiKey
      );
      setMessages((prev) => [...prev, response]);
      addXp(20);
    } catch (err) {
      console.error('Failed to get AI tutor response:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
    };
    recognition.start();
  };

  return (
    <div className="space-y-6">
      {/* Top Scenarios Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(DIALOGUE_TOPICS as any[]).map((topic) => {
          const isSelected = selectedTopicId === topic.id;
          return (
            <button
              key={topic.id}
              onClick={() => setSelectedTopicId(topic.id)}
              className={cn(
                'p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2',
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                  : 'border-border bg-surface hover:bg-muted/50'
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-2xl">{topic.icon}</span>
                <Badge variant={topic.cefr === 'A1' ? 'a1' : topic.cefr === 'A2' ? 'a2' : topic.cefr === 'B1' ? 'b1' : 'b2'}>
                  {topic.cefr}
                </Badge>
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground line-clamp-1">{topic.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-1">{topic.targetWords.join(', ')}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Stream (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col h-[600px] rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
          {/* Scenario Header */}
          <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{currentScenario.icon}</div>
              <div>
                <h3 className="font-bold font-heading text-foreground">{currentScenario.title}</h3>
                <p className="text-xs text-muted-foreground">
                  You: <span className="text-primary font-medium">{currentScenario.userRole}</span> • Tutor:{' '}
                  <span className="text-foreground font-medium">{currentScenario.tutorRole}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowArabic(!showArabic)}
                className="gap-1.5 text-xs"
              >
                <Languages className="h-4 w-4" />
                {showArabic ? 'Hide Arabic' : 'Show Arabic'}
              </Button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex flex-col max-w-[80%] space-y-1',
                    isUser ? 'ml-auto items-end' : 'mr-auto items-start'
                  )}
                >
                  <div
                    className={cn(
                      'p-4 rounded-2xl space-y-2 text-sm shadow-sm',
                      isUser
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-muted/80 text-foreground border border-border/50 rounded-bl-none'
                    )}
                  >
                    <p className="ltr-isolate font-medium leading-relaxed">{msg.english}</p>
                    {showArabic && msg.arabic && (
                      <p
                        className={cn(
                          'text-xs rtl-text border-t pt-1.5',
                          isUser ? 'border-white/20 text-white/90' : 'border-border text-muted-foreground'
                        )}
                      >
                        {msg.arabic}
                      </p>
                    )}
                  </div>

                  {/* Grammar Tip or Vocab Suggestions */}
                  {!isUser && msg.grammarTip && (
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs flex items-start gap-2 max-w-full">
                      <Lightbulb className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-600" />
                      <p>{msg.grammarTip}</p>
                    </div>
                  )}

                  {/* Pronunciation Play Button */}
                  <div className="flex items-center gap-2 px-1">
                    <button
                      onClick={() => AudioEngineService.playWord(msg.english, audioRate)}
                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                    >
                      <Volume2 className="h-3.5 w-3.5" /> Listen
                    </button>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 rounded-xl bg-muted/40 w-fit animate-pulse">
                <Sparkles className="h-4 w-4 text-primary animate-spin" />
                AI Tutor is formulating response...
              </div>
            )}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-surface flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleVoiceInput}
              title="Speak into Microphone"
            >
              <Mic className="h-4 w-4 text-primary" />
            </Button>
            <Input
              type="text"
              placeholder="Type your response in English..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 ltr-isolate"
            />
            <Button type="submit" disabled={!inputValue.trim() || isLoading} className="gap-2">
              <span>Send</span>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Sidebar: Target Words & Scenario Goals */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Target Oxford 3000 Vocabulary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Try using these target headwords during your conversation to earn extra mastery XP:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {currentScenario.targetWords.map((word) => (
                  <button
                    key={word}
                    onClick={() => {
                      setInputValue((prev) => `${prev} ${word}`.trim());
                      AudioEngineService.playWord(word, audioRate);
                    }}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-muted hover:bg-primary/10 hover:text-primary transition-colors border border-border"
                  >
                    + {word}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" />
                <span>Gemini API Key (Optional)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {geminiApiKey
                  ? 'Custom Gemini API Key active for ultra-personalized live dialogue.'
                  : 'Using built-in high-fidelity AI persona engine. You can connect your own key anytime.'}
              </p>
              <Input
                type="password"
                placeholder="Paste AI Studio API Key..."
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="text-xs"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
