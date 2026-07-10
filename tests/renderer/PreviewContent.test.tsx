import { render, screen } from '@testing-library/react';
import { PreviewContent } from '../../src/renderer/features/preview/PreviewContent';
import { createTestApi, createTestWrapper, textItem } from './testApi';

describe('PreviewContent', () => {
  it('sanitizes rich clipboard HTML before rendering it', () => {
    const item = { ...textItem, type: 'rich_text' as const, contentHtml: '<p>Hello</p><script>alert(1)</script><img src="x" onerror="alert(2)">' };
    const { container } = render(<PreviewContent item={item} />, { wrapper: createTestWrapper(createTestApi().api) });
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(container.querySelector('script')).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain('onerror');
  });

  it('shows a stable missing-image state', async () => {
    const item = { ...textItem, type: 'image' as const };
    render(<PreviewContent item={item} />, { wrapper: createTestWrapper(createTestApi().api) });
    expect(await screen.findByText('Image file is no longer available on disk.')).toBeInTheDocument();
  });
});
