'use client';
import * as React from 'react';
import { cn } from '@/lib/utils/cn';

import { Icon } from '@/components/ui/icon';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Dialog({ isOpen, onClose, title, children }: DialogProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-scrim z-50 transition-opacity" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-32px)] max-w-md bg-bg-overlay rounded-[28px] p-6 z-50 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="headline-small text-primary">{title}</h3>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-hover-overlay text-text-secondary transition-colors"
          >
            <Icon name="close" size={24} />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}
