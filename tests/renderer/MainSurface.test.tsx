import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MainSurface } from '../../src/renderer/features/history/MainSurface';
import { createTestApi, createTestWrapper, textItem } from './testApi';

describe('MainSurface', () => {
  it('loads history and refetches it after a Tauri item event', async () => {
    const secondItem = { ...textItem, id: 'item-2', title: 'Second capture', contentHash: 'hash-2' };
    const testApi = createTestApi();
    render(<MainSurface />, { wrapper: createTestWrapper(testApi.api) });
    expect(await screen.findByText('First capture')).toBeInTheDocument();
    await userEvent.setup().click(screen.getAllByRole('button', { name: 'Copy' })[0]);
    expect(testApi.api.copyItem).toHaveBeenCalledWith('item-1');

    vi.mocked(testApi.api.getItems).mockResolvedValue([textItem, secondItem]);
    act(() => testApi.emitItemsChanged());
    expect(await screen.findByText('Second capture')).toBeInTheDocument();
  });

  it('updates history queries when the user searches and opens Settings lazily', async () => {
    const testApi = createTestApi();
    const user = userEvent.setup();
    render(<MainSurface />, { wrapper: createTestWrapper(testApi.api) });
    const search = await screen.findByPlaceholderText('Search title, preview, URL');
    await user.type(search, 'hello');
    await waitFor(() => expect(testApi.api.getItems).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'hello' })));
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    expect(await screen.findByText('Start At Login')).toBeInTheDocument();
  });

  it('inserts a clipboard event into Recent Captures before the fallback refetch completes', async () => {
    const testApi = createTestApi();
    render(<MainSurface />, { wrapper: createTestWrapper(testApi.api) });
    expect(await screen.findAllByText('First capture')).not.toHaveLength(0);
    const instantItem = { ...textItem, id: 'instant-item', title: 'Instant capture', contentHash: 'instant-hash', contentText: null };
    act(() => testApi.emitClipboard(instantItem));
    expect(screen.getAllByText('Instant capture')).not.toHaveLength(0);
  });
});
