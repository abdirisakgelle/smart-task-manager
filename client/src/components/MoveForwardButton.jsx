import React from 'react';
import { useMoveForwardIdeaMutation } from '@/store/api/apiSlice';

export default function MoveForwardButton({ ideaId, disabled, note, onDone }){
  const [moveForward, { isLoading }] = useMoveForwardIdeaMutation();

  const handleClick = async () => {
    try {
      await moveForward({ id: ideaId, body: { note } }).unwrap();
      onDone && onDone();
    } catch (e) {
      const msg = e?.data?.error || 'Failed to move forward';
      alert(msg);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className="inline-flex items-center px-3 py-1.5 rounded-md bg-red-600 text-white text-sm disabled:opacity-50"
      title={disabled ? 'Not permitted' : 'Move to next stage'}
    >
      {isLoading ? 'Moving...' : 'Move Forward'}
    </button>
  );
}