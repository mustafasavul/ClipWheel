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

  it('saves and deletes the current wheel appearance as a named preset', async () => {
    const testApi = createTestApi();
    const user = userEvent.setup();
    render(<MainSurface />, { wrapper: createTestWrapper(testApi.api) });

    await user.click(await screen.findByRole('button', { name: 'Settings' }));
    await user.click(await screen.findByRole('button', { name: 'Wheel Appearance' }));
    expect(screen.getByRole('button', { name: 'Mono Slate' })).toBeInTheDocument();

    await user.type(screen.getByLabelText('Preset Name'), 'Focus Lime');
    await user.click(screen.getByRole('button', { name: 'Save Preset' }));

    await waitFor(() => expect(testApi.api.updateSettings).toHaveBeenCalledWith(expect.objectContaining({
      wheelAppearancePresets: [expect.objectContaining({ name: 'Focus Lime' })],
    })));
    expect(await screen.findByRole('button', { name: 'Focus Lime' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete Focus Lime' }));
    await waitFor(() => expect(testApi.api.updateSettings).toHaveBeenLastCalledWith({ wheelAppearancePresets: [] }));
  });

  it('inserts a clipboard event into Recent Captures before the fallback refetch completes', async () => {
    const testApi = createTestApi();
    render(<MainSurface />, { wrapper: createTestWrapper(testApi.api) });
    expect(await screen.findAllByText('First capture')).not.toHaveLength(0);
    const instantItem = { ...textItem, id: 'instant-item', title: 'Instant capture', contentHash: 'instant-hash', contentText: null };
    act(() => testApi.emitClipboard(instantItem));
    expect(screen.getAllByText('Instant capture')).not.toHaveLength(0);
  });

  it('renames an item inline and flags it from a popover without opening a dialog', async () => {
    const testApi = createTestApi();
    const user = userEvent.setup();
    render(<MainSurface />, { wrapper: createTestWrapper(testApi.api) });

    await user.click(await screen.findByRole('button', { name: 'Edit item name' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const nameInput = screen.getByLabelText('Item name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Release checklist');
    await user.keyboard('{Enter}');

    await waitFor(() => expect(testApi.api.updateItemTitle).toHaveBeenCalledWith('item-1', 'Release checklist'));
    await user.click(screen.getAllByRole('button', { name: 'Flag' })[0]);
    expect(screen.getByRole('menu', { name: 'Flag' })).toBeInTheDocument();
    await user.click(screen.getByRole('menuitemradio', { name: 'Red flag' }));
    await waitFor(() => expect(testApi.api.setItemFlag).toHaveBeenCalledWith('item-1', 'red'));

    await user.selectOptions(screen.getByRole('combobox', { name: 'Flag' }), 'red');
    await waitFor(() => expect(testApi.api.getItems).toHaveBeenLastCalledWith(expect.objectContaining({ flagFilter: 'red' })));
  });
});
