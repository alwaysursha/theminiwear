"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  name: string;
  defaultValue?: string;
  className?: string;
};

function exec(command: string, value?: string) {
  document.execCommand(command, false, value);
}

export function RichTextEditor({
  name,
  defaultValue = "",
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function syncHidden() {
    if (editorRef.current && inputRef.current) {
      inputRef.current.value = editorRef.current.innerHTML;
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-1 rounded-t-md border border-b-0 border-slate-200 bg-slate-50 p-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={() => {
            exec("formatBlock", "h2");
            syncHidden();
          }}
        >
          H2
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={() => {
            exec("formatBlock", "h3");
            syncHidden();
          }}
        >
          H3
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={() => {
            exec("bold");
            syncHidden();
          }}
        >
          Bold
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={() => {
            exec("insertUnorderedList");
            syncHidden();
          }}
        >
          List
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={() => {
            const url = window.prompt("Link URL");
            if (url) {
              exec("createLink", url);
              syncHidden();
            }
          }}
        >
          Link
        </Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[200px] rounded-b-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
        dangerouslySetInnerHTML={{ __html: defaultValue }}
        onInput={syncHidden}
        onBlur={syncHidden}
      />
      <input ref={inputRef} type="hidden" name={name} defaultValue={defaultValue} />
    </div>
  );
}
