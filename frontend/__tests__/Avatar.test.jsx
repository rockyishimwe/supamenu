import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import Avatar from '@/components/Avatar';

// Mock next/image — return a plain React img element
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props) => createElement('img', props),
}));

describe('Avatar', () => {
  it('renders initials when no src provided', () => {
    render(createElement(Avatar, { name: 'John Doe' }));
    expect(screen.getByText('JD')).toBeDefined();
  });

  it('renders image when src is provided', () => {
    render(createElement(Avatar, { src: '/avatar.jpg', name: 'John Doe' }));
    const img = screen.getByRole('img');
    expect(img).toBeDefined();
    expect(img.getAttribute('src')).toBe('/avatar.jpg');
  });

  it('renders single initial for one-word name', () => {
    render(createElement(Avatar, { name: 'John' }));
    expect(screen.getByText('J')).toBeDefined();
  });

  it('renders User icon when no name provided', () => {
    render(createElement(Avatar));
    expect(document.querySelector('svg')).toBeDefined();
  });

  it('shows fallback on empty src string', () => {
    render(createElement(Avatar, { src: '', name: 'Jane Doe' }));
    expect(screen.getByText('JD')).toBeDefined();
  });

  it('applies custom className', () => {
    render(createElement(Avatar, { name: 'Test', className: 'extra-class' }));
    const container = screen.getByText('T').closest('div');
    expect(container.getAttribute('class')).toContain('extra-class');
  });

  it('renders with sm size by default', () => {
    render(createElement(Avatar, { name: 'Test' }));
    const container = screen.getByText('T').closest('div');
    expect(container.getAttribute('class')).toContain('w-8');
  });

  it('renders with lg size when specified', () => {
    render(createElement(Avatar, { name: 'Test', size: 'lg' }));
    const container = screen.getByText('T').closest('div');
    expect(container.getAttribute('class')).toContain('w-20');
  });
});
