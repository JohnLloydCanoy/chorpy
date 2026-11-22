import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AddChoreFormProps, AddChorePageContent } from '../components/family/AddChorePageContent';

interface OverlayEntry {
  ownerId: string;
  props: AddChoreFormProps;
}

interface AddChoreOverlayDispatch {
  syncOverlay: (ownerId: string, props: AddChoreFormProps) => void;
  clearOverlay: (ownerId: string) => void;
}

const AddChoreOverlayStateContext = createContext<OverlayEntry | null>(null);
const AddChoreOverlayDispatchContext = createContext<AddChoreOverlayDispatch | null>(null);

export function AddChoreOverlayProvider({ children }: { children: React.ReactNode }) {
  const [entry, setEntry] = useState<OverlayEntry | null>(null);

  const syncOverlay = useCallback((ownerId: string, props: AddChoreFormProps) => {
    setEntry((prev) => {
      if (!props.visible && prev && prev.ownerId !== ownerId) {
        return prev;
      }
      return { ownerId, props };
    });
  }, []);

  const clearOverlay = useCallback((ownerId: string) => {
    setEntry((prev) => (prev && prev.ownerId === ownerId ? null : prev));
  }, []);

  const dispatchValue = useMemo<AddChoreOverlayDispatch>(
    () => ({ syncOverlay, clearOverlay }),
    [syncOverlay, clearOverlay]
  );

  return (
    <AddChoreOverlayDispatchContext.Provider value={dispatchValue}>
      <AddChoreOverlayStateContext.Provider value={entry}>
        {children}
      </AddChoreOverlayStateContext.Provider>
    </AddChoreOverlayDispatchContext.Provider>
  );
}

export function useAddChoreOverlayDispatch(): AddChoreOverlayDispatch | null {
  return useContext(AddChoreOverlayDispatchContext);
}

export const AddChoreOverlayHost = React.memo(function AddChoreOverlayHost() {
  const entry = useContext(AddChoreOverlayStateContext);
  if (!entry) return null;
  return <AddChorePageContent {...entry.props} />;
});
