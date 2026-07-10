import type { Event } from '@tauri-apps/api/event';
import { createClipwheelClient } from '../../src/renderer/api/clipwheelClient';

describe('clipwheelClient subscriptions', () => {
  it('unsubscribes a listener that resolves after the consumer is disposed', async () => {
    let resolveListener: ((unlisten: () => void) => void) | undefined;
    const unlisten = vi.fn();
    const listen = vi.fn(() => new Promise<() => void>((resolve) => {
      resolveListener = resolve;
    }));
    const client = createClipwheelClient({
      invoke: vi.fn(),
      listen,
    });

    const dispose = client.onItemsChanged(vi.fn());
    dispose();
    resolveListener?.(unlisten);
    await Promise.resolve();

    expect(unlisten).toHaveBeenCalledOnce();
  });

  it('forwards event payloads and disposes active listeners', async () => {
    const unlisten = vi.fn();
    let eventHandler: ((event: Event<unknown>) => void) | undefined;
    const listen = async <T,>(_event: string, handler: (event: Event<T>) => void) => {
      eventHandler = (event) => handler(event as Event<T>);
      return unlisten;
    };
    const handler = vi.fn();
    const client = createClipwheelClient({ invoke: vi.fn(), listen });

    const dispose = client.onItemsChanged(handler);
    await Promise.resolve();
    eventHandler?.({ event: 'items-changed', id: 1, payload: undefined });
    dispose();

    expect(handler).toHaveBeenCalledOnce();
    expect(unlisten).toHaveBeenCalledOnce();
  });

  it('retries a Tauri listener that fails during startup', async () => {
    vi.useFakeTimers();
    try {
      const unlisten = vi.fn();
      const listen = vi.fn()
        .mockRejectedValueOnce(new Error('Tauri event bridge not ready'))
        .mockResolvedValueOnce(unlisten);
      const client = createClipwheelClient({ invoke: vi.fn(), listen });
      const dispose = client.onItemsChanged(vi.fn());
      await Promise.resolve();
      expect(listen).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(1_000);
      expect(listen).toHaveBeenCalledTimes(2);
      dispose();
      expect(unlisten).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });
});
