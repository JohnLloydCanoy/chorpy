import React, { useEffect, useId } from 'react';
import { useAddChoreOverlayDispatch } from '../../context/AddChoreOverlayContext';
import { AddChoreFormProps, AddChorePageContent } from './AddChorePageContent';

export type { AddChoreFormProps } from './AddChorePageContent';

/**
 * Full-screen Add Household Chore bridge.
 * Syncs props to the root AddChoreOverlayHost so the slide-up page covers
 * the entire app viewport cleanly without nesting React Native Modals.
 */
export const AddChoreForm = React.memo(function AddChoreForm(props: AddChoreFormProps) {
  const dispatch = useAddChoreOverlayDispatch();
  const ownerId = useId();
  const syncOverlay = dispatch?.syncOverlay;
  const clearOverlay = dispatch?.clearOverlay;

  useEffect(() => {
    if (!syncOverlay) return;
    syncOverlay(ownerId, props);
  }, [syncOverlay, ownerId, props]);

  useEffect(() => {
    if (!clearOverlay) return;
    return () => {
      clearOverlay(ownerId);
    };
  }, [clearOverlay, ownerId]);

  if (!dispatch) {
    return <AddChorePageContent {...props} />;
  }

  return null;
});
