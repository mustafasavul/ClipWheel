import type React from 'react';
import type { AppApi } from '../../shared/types';
import { ClipwheelApiContext } from './clipwheelQueries';

export function ClipwheelApiProvider({ api, children }: { api: AppApi; children: React.ReactNode }) {
  return <ClipwheelApiContext.Provider value={api}>{children}</ClipwheelApiContext.Provider>;
}
