import type { Session } from '@/types';
import {atomWithStorage} from 'jotai/utils';

export const currentViewAtom = atomWithStorage<'sessions' | 'timeline' | 'grid'>('currentView', 'sessions');
export const sessionsAtom = atomWithStorage<Session[]>('sessions', []);