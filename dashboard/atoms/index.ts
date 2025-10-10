import {atomWithStorage} from 'jotai/utils';

export const currentViewAtom = atomWithStorage<'sessions' | 'timeline' | 'grid'>('currentView', 'sessions');