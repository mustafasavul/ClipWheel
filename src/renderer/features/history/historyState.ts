import type { HistoryQuery } from '../../../shared/types';
import type { SettingsTabId } from '../settings/settingsConfig';

export interface HistoryUiState {
  view: 'history' | 'settings';
  selectedId: string | null;
  query: HistoryQuery;
  page: number;
  pageSize: number;
  settingsTab: SettingsTabId;
}

export const initialHistoryUiState: HistoryUiState = {
  view: 'history',
  selectedId: null,
  query: { type: 'all', dateFilter: 'all' },
  page: 1,
  pageSize: 10,
  settingsTab: 'general',
};

export type HistoryUiAction =
  | { type: 'show'; view: HistoryUiState['view'] }
  | { type: 'select'; id: string }
  | { type: 'query'; patch: Partial<HistoryQuery> }
  | { type: 'page'; page: number }
  | { type: 'pageSize'; pageSize: number }
  | { type: 'settingsTab'; tab: SettingsTabId }
  | { type: 'clipboardItem' };

export function historyUiReducer(state: HistoryUiState, action: HistoryUiAction): HistoryUiState {
  switch (action.type) {
    case 'show': return { ...state, view: action.view };
    case 'select': return { ...state, selectedId: action.id };
    case 'query': return { ...state, query: { ...state.query, ...action.patch }, page: 1 };
    case 'page': return { ...state, page: Math.max(1, action.page) };
    case 'pageSize': return { ...state, pageSize: action.pageSize, page: 1 };
    case 'settingsTab': return { ...state, settingsTab: action.tab };
    case 'clipboardItem': return { ...state, page: 1 };
  }
}
