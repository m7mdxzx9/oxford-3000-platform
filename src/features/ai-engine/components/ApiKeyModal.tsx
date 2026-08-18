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
  Activity,
  Loader2,
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
import { GrokService } from '../services/grokService';
import { GrokConnectionStatus } from '../types';
import { cn } from '@/lib/utils';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = React.useState('');
  const [showKey, setShowKey] = React.useState(false);
  const [status, setStatus] = React.useState<GrokConnectionStatus>('disconnected');
  const [feedbackMsg, setFeedbackMsg] = React.useState<string | null>(null);
  const [isValidating, setIsValidating] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const stored = GrokService.getStoredApiKey();
      setApiKey(stored);
      setStatus(stored ? 'active' : 'disconnected');
      setFeedbackMsg(null);
    }
  }, [isOpen]);

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setFeedbackMsg('الرجاء إدخال مفتاح Grok API أولاً.');
      return;
    }

    setIsValidating(true);
    setStatus('validating');
    setFeedbackMsg(null);

    const check = await GrokService.validateApiKey(apiKey.trim());
    setIsValidating(false);

    if (check.valid) {
      GrokService.setStoredApiKey(apiKey.trim());
      setStatus('active');
      setFeedbackMsg('تم التحقق من الاتصال بنجاح وتفعيل مفتاح Grok (xAI)!');
    } else {
      setStatus('error');
      setFeedbackMsg(`فشل التحقق: ${check.error}`);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    GrokService.setStoredApiKey(apiKey.trim());
    setStatus('active');
    setFeedbackMsg('تم حفظ وتفعيل مفتاح Grok محلياً بنجاح.');
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleDelete = () => {
    GrokService.removeStoredApiKey();
    setApiKey('');
    setStatus('disconnected');
    setFeedbackMsg('تم حذف مفتاح Grok. يعمل التطبيق الآن بالمحرك التعليمي المدمج.');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="archetype-card max-w-md p-6 sm:p-8 bg-surface">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black font-heading text-foreground flex items-center gap-2">
                <span>Grok (xAI) API Key</span>
                <Badge variant="accent" className="archetype-badge text-[10px]">
                  PRO
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                تكوين وحفظ مفتاح الذكاء الاصطناعي لتوليد الجمل التكيفية بدون حظر CORS.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Real-time Connection Status */}
          <div className="p-4 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Activity
                className={cn(
                  'h-4 w-4',
                  status === 'active'
                    ? 'text-emerald-500 animate-pulse'
                    : status === 'error'
                    ? 'text-red-500'
                    : 'text-muted-foreground'
                )}
              />
              <div>
                <p className="text-xs font-bold text-foreground">
                  {status === 'active'
                    ? 'المفتاح نشط ومتصل بخوادم xAI'
                    : status === 'validating'
                    ? 'جاري فحص الاتصال عبر الخادم الوكيل...'
                    : status === 'error'
                    ? 'خطأ في المصادقة أو المفتاح'
                    : 'يعمل بالمحرك التعليمي المدمج'}
                </p>
                <p className="text-[10px] text-muted-foreground">Proxy: /api/ai/generate-sentence</p>
              </div>
            </div>

            <Badge
              variant={status === 'active' ? 'default' : 'outline'}
              className="archetype-badge text-[10px]"
            >
              {status.toUpperCase()}
            </Badge>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>مفتاح Grok API Key (xai-...):</span>
                {apiKey && (
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
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
                  placeholder="xai-xxxxxxxxxxxxxxxxxxxxxxxx"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono text-xs pr-10 ltr-isolate"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Notification Alert */}
            {feedbackMsg && (
              <div
                className={cn(
                  'p-3 rounded-lg border text-xs flex items-center gap-2 animate-in fade-in',
                  status === 'active'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-300'
                )}
              >
                {status === 'active' ? (
                  <Check className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                <span>{feedbackMsg}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={isValidating || !apiKey.trim()}
                className="archetype-btn text-xs gap-1.5"
              >
                {isValidating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Activity className="h-3.5 w-3.5" />
                )}
                <span>اختبار المفتاح (Test Key)</span>
              </Button>

              <div className="flex items-center gap-2">
                {apiKey && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    className="archetype-btn text-xs gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>حذف</span>
                  </Button>
                )}

                <Button
                  type="submit"
                  disabled={!apiKey.trim()}
                  className="archetype-btn text-xs gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>حفظ المفتاح</span>
                </Button>
              </div>
            </div>
          </form>

          {/* Security & Link Footer */}
          <div className="border-t border-border/40 pt-3 text-[11px] text-muted-foreground space-y-1">
            <p className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>يتم تخزين المفتاح محلياً في متصفحك تحت `grok_api_key` ولا يتم مشاركته إطلاقاً.</span>
            </p>
            <a
              href="https://x.ai/api"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1 font-semibold"
            >
              <span>احصل على مفتاح Grok API من منصة xAI الرسمية</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const GrokKeySettingsModal = ApiKeyModal;
