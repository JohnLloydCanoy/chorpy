import { useCallback, useState } from 'react';
import { Chore, UserRole } from '../types';
import { normalizeToMinute } from '../utils/choreScheduleUtils';

export type ChoreSheetMode = 'create' | 'edit' | 'view';

export interface ChoreSheetController {
  isOpen: boolean;
  mode: ChoreSheetMode;
  selectedChore: Chore | null;
  initialScheduledAt: Date | null;
  sessionKey: number;
  openCreate: (initialDate?: Date) => void;
  openChore: (chore: Chore) => void;
  closeSheet: () => void;
}

/**
 * Shared state machine driving the full-screen Slide-Up Chore page across
 * HomeScreen (calendar) and MyFamilyScreen (chores list & notifications).
 */
export function useChoreSheetState(role: UserRole): ChoreSheetController {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChoreSheetMode>('create');
  const [selectedChore, setSelectedChore] = useState<Chore | null>(null);
  const [initialScheduledAt, setInitialScheduledAt] = useState<Date | null>(null);
  const [sessionKey, setSessionKey] = useState(0);

  const openCreate = useCallback(
    (initialDate?: Date) => {
      if (role !== 'parent') return;
      const validDate =
        initialDate instanceof Date && !Number.isNaN(initialDate.getTime())
          ? normalizeToMinute(initialDate)
          : null;
      setMode('create');
      setSelectedChore(null);
      setInitialScheduledAt(validDate);
      setSessionKey((prev) => prev + 1);
      setIsOpen(true);
    },
    [role]
  );

  const openChore = useCallback(
    (chore: Chore) => {
      if (!chore || chore.id.startsWith('temp-')) return;
      setMode(role === 'parent' ? 'edit' : 'view');
      setSelectedChore(chore);
      setInitialScheduledAt(null);
      setSessionKey((prev) => prev + 1);
      setIsOpen(true);
    },
    [role]
  );

  const closeSheet = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    mode,
    selectedChore,
    initialScheduledAt,
    sessionKey,
    openCreate,
    openChore,
    closeSheet,
  };
}
