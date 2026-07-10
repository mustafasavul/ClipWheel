import { act, renderHook, waitFor } from '@testing-library/react';
import { defaultSettings } from '../../src/shared/settings';
import type { Settings } from '../../src/shared/types';
import { useSettingsMutation } from '../../src/renderer/data/clipwheelQueries';
import { createTestApi, createTestWrapper } from './testApi';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((next) => { resolve = next; });
  return { promise, resolve };
}

describe('useSettingsMutation', () => {
  it('serializes rapid settings writes so an older response cannot win', async () => {
    const first = deferred<Settings>();
    const second = deferred<Settings>();
    const updateSettings = vi.fn()
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise);
    const testApi = createTestApi({ updateSettings });
    const { result } = renderHook(() => useSettingsMutation(), { wrapper: createTestWrapper(testApi.api) });

    let firstRequest!: Promise<Settings>;
    let secondRequest!: Promise<Settings>;
    act(() => {
      firstRequest = result.current.mutateAsync({ theme: 'dark' });
      secondRequest = result.current.mutateAsync({ theme: 'light' });
    });
    await waitFor(() => expect(updateSettings).toHaveBeenCalledTimes(1));
    first.resolve({ ...defaultSettings, theme: 'dark' });
    await firstRequest;
    await waitFor(() => expect(updateSettings).toHaveBeenCalledTimes(2));
    second.resolve({ ...defaultSettings, theme: 'light' });
    await secondRequest;
    expect(updateSettings.mock.calls.map(([patch]) => patch)).toEqual([{ theme: 'dark' }, { theme: 'light' }]);
  });
});
