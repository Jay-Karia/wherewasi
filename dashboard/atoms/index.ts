import type { Session } from '@/types';
import {atomWithStorage} from 'jotai/utils';

export const currentViewAtom = atomWithStorage<'sessions' | 'timeline' | 'list'>('currentView', 'sessions');
export const sessionsAtom = atomWithStorage<Session[]>('sessions', []);