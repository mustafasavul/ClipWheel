import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WheelSurface } from '../../src/renderer/features/wheel/WheelSurface';
import { createTestApi, createTestWrapper } from './testApi';

describe('WheelSurface', () => {
  it('copies the active item with the configured apply shortcut', async () => {
    const testApi = createTestApi();
    render(<WheelSurface />, { wrapper: createTestWrapper(testApi.api) });
    const wheel = await screen.findByRole('application', { name: 'ClipWheel radial clipboard wheel' });
    expect(await screen.findAllByText('First capture')).not.toHaveLength(0);
    fireEvent.keyDown(wheel, { key: 'Enter', code: 'Enter' });
    await waitFor(() => expect(testApi.api.copyItem).toHaveBeenCalledWith('item-1'));
  });
});
