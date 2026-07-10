import { historyUiReducer, initialHistoryUiState } from '../../src/renderer/features/history/historyState';

describe('historyUiReducer', () => {
  it('resets pagination when query or page size changes', () => {
    const paged = { ...initialHistoryUiState, page: 4 };
    expect(historyUiReducer(paged, { type: 'query', patch: { search: 'hello' } })).toMatchObject({ page: 1, query: { search: 'hello' } });
    expect(historyUiReducer(paged, { type: 'pageSize', pageSize: 25 })).toMatchObject({ page: 1, pageSize: 25 });
  });
});
