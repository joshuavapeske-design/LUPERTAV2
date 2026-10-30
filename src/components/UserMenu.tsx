/* eslint-disable no-console,@typescript-eslint/no-explicit-any */
'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Bookmark, SlidersHorizontal, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import LanguageSwitcher from '@/components/LanguageSwitcher';

const MENU_PANEL_GAP = 8;
const MENU_PANEL_MIN_TOP = 68;

type UserAvatarSize = 'default' | 'compact';

interface UserMenuProps {
  triggerClassName?: string;
  avatarSize?: UserAvatarSize;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  triggerClassName,
  avatarSize = 'default',
}) => {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerFocusRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState({
    top: 58,
    right: 12,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const updateMenuPosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect || typeof window === 'undefined') return;

    setMenuPosition({
      top: Math.max(MENU_PANEL_MIN_TOP, rect.bottom + MENU_PANEL_GAP),
      right: Math.max(MENU_PANEL_GAP, window.innerWidth - rect.right),
    });
  }, []);

  const canUseHoverMenu = useCallback(() => {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }, []);

  const handleOpenMenu = useCallback(() => {
    clearCloseTimer();
    updateMenuPosition();
    setIsOpen(true);
  }, [clearCloseTimer, updateMenuPosition]);

  const handleHoverOpenMenu = useCallback(() => {
    if (!canUseHoverMenu()) return;
    handleOpenMenu();
  }, [canUseHoverMenu, handleOpenMenu]);

  const handleCloseMenu = useCallback(() => {
    clearCloseTimer();
    setIsOpen(false);
  }, [clearCloseTimer]);

  const handleMenuClick = () => {
    pointerFocusRef.current = false;
    clearCloseTimer();
    updateMenuPosition();
    setIsOpen((prev) => !prev);
  };

  const handleMenuPointerDown = () => {
    pointerFocusRef.current = true;
  };

  const handleMenuFocus = () => {
    if (pointerFocusRef.current) return;
    handleOpenMenu();
  };

  const scheduleCloseMenu = useCallback(() => {
    if (!canUseHoverMenu()) return;

    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      closeTimerRef.current = null;
    }, 160);
  }, [canUseHoverMenu, clearCloseTimer]);

  useEffect(() => {
    if (!isOpen) return;

    updateMenuPosition();

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      handleCloseMenu();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseMenu();
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [handleCloseMenu, isOpen, updateMenuPosition]);

  useEffect(() => {
    return clearCloseTimer;
  }, [clearCloseTimer]);

  const avatarSizeClass =
    avatarSize === 'compact' ? 'h-8 w-8 text-xs' : 'h-11 w-11 text-sm';

  const menuPanel = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleCloseMenu}
          className='ui-glass-panel fixed z-[1000] w-64 p-2 shadow-2xl'
          style={{
            top: menuPosition.top,
            right: menuPosition.right,
            originX: 0.93,
            originY: 0,
          }}
          initial={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.88, y: -8, filter: 'blur(8px)' }
          }
          animate={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }
          }
          exit={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.9, y: -6, filter: 'blur(6px)' }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  type: 'spring',
                  stiffness: 520,
                  damping: 38,
                  mass: 0.7,
                }
          }
        >
          {/* Header */}
          <div className='border-b border-[var(--ui-glass-divider)] px-2 pb-2.5 pt-1'>
            <div className='flex items-center justify-between gap-2'>
              <div className='flex items-center gap-1.5'>
                <Sparkles className='h-3.5 w-3.5 text-amber-400' />
                <span className='text-xs font-semibold uppercase tracking-wider text-zinc-200'>
                  LUPERTA
                </span>
              </div>
              <span className='inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300 ring-1 ring-emerald-500/30'>
                Active
              </span>
            </div>
            <div className='mt-1 flex items-center justify-between text-[11px] text-zinc-400'>
              <span>Discovery & Streaming</span>
              <span className='text-[10px] text-zinc-500'>Local Storage</span>
            </div>
          </div>

          {/* Quick links & preferences */}
          <div className='pt-1.5 space-y-1'>
            <Link
              href='/my'
              onClick={() => setIsOpen(false)}
              className='ui-glass-row flex w-full items-center gap-2.5 rounded-[var(--ui-radius-row)] px-2.5 py-2 text-left text-[13px] text-zinc-200 hover:text-white transition-colors'
            >
              <Bookmark className='h-4 w-4 text-zinc-400' />
              <span className='font-medium'>{t('common.myLibrary')}</span>
            </Link>

            <LanguageSwitcher variant='menuItem' />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div
      ref={triggerRef}
      className={`relative ${triggerClassName || ''}`}
      onMouseEnter={handleHoverOpenMenu}
      onMouseLeave={scheduleCloseMenu}
    >
      <button
        type='button'
        onClick={handleMenuClick}
        onPointerDown={handleMenuPointerDown}
        onFocus={handleMenuFocus}
        onBlur={scheduleCloseMenu}
        aria-haspopup='menu'
        aria-expanded={isOpen}
        aria-label='Preferences'
        className={`ui-glass-control flex items-center justify-center transition-transform active:scale-95 ${avatarSizeClass} ${
          isOpen ? 'ui-glass-control-active' : ''
        }`}
      >
        <SlidersHorizontal className='h-4 w-4 text-zinc-300' />
      </button>

      {mounted && typeof document !== 'undefined'
        ? createPortal(menuPanel, document.body)
        : null}
    </div>
  );
};
