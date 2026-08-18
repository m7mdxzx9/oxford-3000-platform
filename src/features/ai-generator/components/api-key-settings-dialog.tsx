'use client';

import * as React from 'react';
import {
  Key,
  Eye,
  EyeOff,
  Check,
  Trash2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useApiKey } from '../hooks/use-api-key';
import { ApiKeyProvider } from '../types';
import { cn } from '@/lib/utils';

interface ApiKeySettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeySettingsDialog({ isOpen, onClose }: ApiKeySettingsDialogProps) {
  const {
    apiKey,
    provider,
    isConfigured,
    showKey,
    maskedKey,
    saveKey,
    deleteKey,
    setProvider,
    toggleShowKey,
  } = useApiKey();

  const [inputVal, setInputVal] = React.useState('');
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setInputVal(apiKey);
      setSuccessMsg(null);
    }
  }, [isOpen, apiKey]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const ok = saveKey(inputVal.trim(), provider);
    if (ok) {
      setSuccessMsg('تم حفظ مفتاح الـ API وتفعيله بنجاح!');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleDelete = () => {
    deleteKey(provider);
    setInputVal('');
    setSuccessMsg('تم حذف مفتاح الـ API.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 sm:p-7">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold font-heading text-foreground">
                إدارة مفتاح الذكاء الاصطناعي (AI API Key)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                تكوين وحفظ مفتاح الذكاء الاصطناعي لتوليد الجمل والقصص الحية.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Provider Selector Tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              مزود الخدمة (AI Provider):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'gemini', label: 'Google Gemini' },
                  { id: 'openai', label: 'OpenAI GPT' },
                  { id: 'groq', label: 'Groq Llama' },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProvider(p.id as ApiKeyProvider)}
                  className={cn(
                    'archetype-badge py-2 px-2 text-xs font-bold transition-all text-center cursor-pointer',
                    provider === p.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Current Status Pill */}
          <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isConfigured ? (
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              )}
              <span className="text-xs font-medium text-foreground">
                {isConfigured ? 'المفتاح مفعل ومخزن محلياً' : 'يعمل بالمحرك التعليمي المدمج'}
              </span>
            </div>
            {isConfigured && (
              <Badge variant="default" className="text-[10px] bg-emerald-600">
                Active
              </Badge>
            )}
          </div>

          {/* Input & Form */}
          <form onSubmit={handleSave} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>أدخل مفتاح الـ API:</span>
                {isConfigured && (
                  <button
                    type="button"
                    onClick={toggleShowKey}
                    className="text-xs text-primary flex items-center gap-1 hover:underline"
                  >
                    {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    <span>{showKey ? 'إخفاء' : 'إظهار'}</span>
                  </button>
                )}
              </label>

              <div className="relative">
                <Input
                  type={showKey ? 'text' : 'password'}
                  placeholder="AIzaSy... / sk-..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="font-mono text-xs pr-10"
                />
                <button
                  type="button"
                  onClick={toggleShowKey}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Notification Banner */}
            {successMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs flex items-center gap-1.5 animate-in fade-in">
                <Check className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              {isConfigured ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  className="archetype-btn text-xs gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>حذف المفتاح</span>
                </Button>
              ) : (
                <div />
              )}

              <Button
                type="submit"
                disabled={!inputVal.trim()}
                className="archetype-btn text-xs gap-1.5 ml-auto"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>حفظ وتفعيل</span>
              </Button>
            </div>
          </form>

          {/* Security & Link Footer */}
          <div className="border-t border-border/40 pt-3 text-[11px] text-muted-foreground space-y-1">
            <p className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>يتم تخزين المفتاح مشفراً في متصفحك محلياً ولا يُرسل لأي خادم خارجي وسيط.</span>
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1 font-semibold"
            >
              <span>احصل على مفتاح مجاني من Google AI Studio</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
