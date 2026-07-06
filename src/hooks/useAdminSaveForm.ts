"use client";

import { useRouter } from "next/navigation";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import type { AdminSaveState } from "@/lib/admin-form-state";

export function useAdminSaveForm(
  action: (
    prev: AdminSaveState,
    formData: FormData,
  ) => Promise<AdminSaveState>,
  initialState: AdminSaveState = {},
) {
  const router = useRouter();
  const [showSaved, setShowSaved] = useState(false);
  const [state, formAction, pending] = useActionState(action, initialState);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) {
      if (state.ok) {
        setShowSaved(true);
        router.refresh();
      } else if (state.error) {
        setShowSaved(false);
      }
    }
    wasPending.current = pending;
  }, [pending, state.ok, state.error, router]);

  const markDirty = useCallback(() => {
    setShowSaved(false);
  }, []);

  return {
    state,
    formAction,
    pending,
    showSaved,
    markDirty,
    saved: showSaved && Boolean(state.ok),
  };
}
