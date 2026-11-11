import { useEffect, useMemo, useState } from 'react';
import { useImStore } from '@/store/imStore';
import type { ImSnapshot } from '@/store/imSelectors';

/** 统一读取 Store 快照：页面所有派生数据都基于它，禁止直接引用静态种子 */
export function useImSnapshot(): ImSnapshot {
  const sessions = useImStore((s) => s.sessions);
  const messages = useImStore((s) => s.messages);
  const groups = useImStore((s) => s.groups);
  const contacts = useImStore((s) => s.contacts);
  const serviceAccounts = useImStore((s) => s.serviceAccounts);
  const serviceTickets = useImStore((s) => s.serviceTickets);
  const imApps = useImStore((s) => s.imApps);
  const topics = useImStore((s) => s.topics);
  const drafts = useImStore((s) => s.drafts);
  const notes = useImStore((s) => s.notes);
  const joinRequests = useImStore((s) => s.joinRequests);
  return useMemo<ImSnapshot>(() => ({
    sessions, messages, groups, contacts, serviceAccounts, serviceTickets, imApps, topics, drafts, notes, joinRequests,
  }), [sessions, messages, groups, contacts, serviceAccounts, serviceTickets, imApps, topics, drafts, notes, joinRequests]);
}

export function useToast(duration = 1600) {
  const [toast, setToast] = useState('');
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), duration);
    return () => clearTimeout(timer);
  }, [toast, duration]);
  return { toast, showToast: setToast };
}
