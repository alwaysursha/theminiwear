"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import type { AdminSaveState } from "@/lib/admin-form-state";

export function useAdminSaveForm(
  action: (
    prev: AdminSaveState,
    formData: FormData,
  ) => Promise<AdminSaveState>,
  initialState: AdminSaveState = {},
) {
  const [showSaved, setShowSaved] = useState(false);
  const [state, formAction, pending] = useActionState(action, initialState);

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
