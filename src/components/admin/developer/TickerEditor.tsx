"use client";

import { useActionState, useEffect, useState } from "react";
import { Megaphone, Plus, X } from "lucide-react";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { TickerStaticPreview } from "@/components/storefront/AnnouncementTicker";
import type { TickerSettings } from "@/lib/ticker";
import { normalizeTickerMessages } from "@/lib/ticker";
import {
  saveTickerSettings,
  type TickerSaveState,
} from "@/lib/actions/developer";
import { AdminSaveButton } from "@/components/admin/AdminSaveButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialSaveState: TickerSaveState = {};

export function TickerEditor({ ticker }: { ticker: TickerSettings }) {
  const [messages, setMessages] = useState<string[]>(
    ticker.messages.length > 0 ? ticker.messages : [""],
  );
  const [showSaved, setShowSaved] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{
    index: number;
    label: string;
  } | null>(null);
  const [state, formAction, pending] = useActionState(
    saveTickerSettings,
    initialSaveState,
  );

  useEffect(() => {
    if (state.ok && !pending) {
      setShowSaved(true);
    }
  }, [state.ok, pending]);

  useEffect(() => {
    if (state.error) {
      setShowSaved(false);
    }
  }, [state.error]);

  function markDirty() {
    setShowSaved(false);
  }

  function updateMessage(index: number, value: string) {
    markDirty();
    setMessages((current) =>
      current.map((message, i) => (i === index ? value : message)),
    );
  }

  function addMessage() {
    markDirty();
    setMessages((current) => [...current, ""]);
  }

  function requestRemoveMessage(index: number) {
    if (messages.length <= 1) {
      return;
    }

    const label = messages[index]?.trim() || `Message ${index + 1}`;
    setRemoveTarget({ index, label });
  }

  function confirmRemoveMessage() {
    if (!removeTarget) {
      return;
    }

    markDirty();
    setMessages((current) =>
      current.filter((_, i) => i !== removeTarget.index),
    );
    setRemoveTarget(null);
  }

  const previewMessages = normalizeTickerMessages(messages);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form
        action={formAction}
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-slate-400" />
          <h3 className="font-semibold text-slate-900">Announcement ticker</h3>
        </div>
        <p className="text-sm text-slate-500">
          Each line scrolls in order, separated by a slash with equal spacing on
          both sides — for example:{" "}
          <span className="whitespace-pre font-mono text-xs text-slate-600">
            {"          /          Message 1          /          Message 2          /          "}
          </span>
        </p>

        {state.error && (
          <p
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {state.error}
          </p>
        )}

        <div className="space-y-3">
          <Label>Ticker messages</Label>
          {messages.map((message, index) => (
            <div key={index} className="flex gap-2">
              <Input
                name="messages"
                value={message}
                onChange={(event) => updateMessage(index, event.target.value)}
                placeholder={`Message ${index + 1}`}
                className="rounded-lg border-slate-200"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => requestRemoveMessage(index)}
                disabled={messages.length <= 1}
                className="shrink-0 rounded-lg"
                aria-label={`Remove message ${index + 1}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addMessage}
            className="rounded-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add message
          </Button>
        </div>

        <AdminSaveButton
          pending={pending}
          saved={showSaved && Boolean(state.ok)}
          label="Save ticker"
        />
      </form>

      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Live preview
        </p>
        {previewMessages.length > 0 ? (
          <div className="mt-3">
            <TickerStaticPreview messages={messages} />
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            Add at least one message to show the ticker on the storefront.
          </p>
        )}
        <p className="mt-4 text-xs text-slate-400">
          With two messages, the bar loops as Message 1 → Message 2 → Message 1 →
          Message 2. When site-wide sale is on, a red banner appears below this
          ticker automatically.
        </p>
      </div>

      <AdminConfirmDialog
        open={removeTarget != null}
        title="Remove ticker message?"
        description={
          <>
            This message will be removed from the storefront ticker. You can add
            it again anytime before saving.
            {removeTarget && (
              <span className="mt-3 block rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-medium text-slate-900">
                &ldquo;{removeTarget.label}&rdquo;
              </span>
            )}
          </>
        }
        confirmLabel="Remove message"
        cancelLabel="Keep message"
        onConfirm={confirmRemoveMessage}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}
