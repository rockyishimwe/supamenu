import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createElement } from 'react';
import MenuItemCard from '@/components/MenuItemCard';

// Mock next/image
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props) => createElement('img', props),
}));

// Mock framer-motion motion.div to render a plain div
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Plus: () => createElement('svg', { 'data-testid': 'plus-icon' }),
  Star: () => createElement('svg', { 'data-testid': 'star-icon' }),
}));

const baseItem = {
  _id: 'item1',
  name: 'Classic Burger',
  price: 12.99,
  image: '/burger.jpg',
};

describe('MenuItemCard', () => {
  it('renders item name and price', () => {
    render(createElement(MenuItemCard, { item: baseItem }));
    expect(screen.getByText('Classic Burger')).toBeDefined();
    expect(screen.getByText('$12.99')).toBeDefined();
  });

  it('renders item image', () => {
    render(createElement(MenuItemCard, { item: baseItem }));
    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toBe('/burger.jpg');
  });

  it('renders rating when provided', () => {
    render(createElement(MenuItemCard, { item: { ...baseItem, rating: 4.5 } }));
    expect(screen.getByText('4.5')).toBeDefined();
  });

  it('does not render rating when not provided', () => {
    render(createElement(MenuItemCard, { item: baseItem }));
    expect(screen.queryByText('4.5')).toBeNull();
  });

  it('renders tags when provided', () => {
    render(createElement(MenuItemCard, { item: { ...baseItem, tags: ['Popular', 'Spicy'] } }));
    expect(screen.getByText('Popular')).toBeDefined();
    expect(screen.getByText('Spicy')).toBeDefined();
  });

  it('does not render tags when not provided', () => {
    render(createElement(MenuItemCard, { item: baseItem }));
    expect(screen.queryByText('Popular')).toBeNull();
  });

  it('renders at most 2 tags', () => {
    render(createElement(MenuItemCard, { item: { ...baseItem, tags: ['A', 'B', 'C'] } }));
    expect(screen.getByText('A')).toBeDefined();
    expect(screen.getByText('B')).toBeDefined();
    expect(screen.queryByText('C')).toBeNull();
  });

  it('calls onAdd with item when Add to Cart clicked', () => {
    const onAdd = vi.fn();
    render(createElement(MenuItemCard, { item: baseItem, onAdd }));

    fireEvent.click(screen.getByText('Add to Cart'));
    expect(onAdd).toHaveBeenCalledWith(baseItem);
  });

  it('renders Add to Cart button', () => {
    render(createElement(MenuItemCard, { item: baseItem }));
    expect(screen.getByText('Add to Cart')).toBeDefined();
  });

  it('works without onAdd prop', () => {
    render(createElement(MenuItemCard, { item: baseItem }));
    fireEvent.click(screen.getByText('Add to Cart'));
    // Should not throw even without onAdd
  });

  it('renders Plus icon on the button', () => {
    render(createElement(MenuItemCard, { item: baseItem }));
    expect(document.querySelector('[data-testid="plus-icon"]')).toBeDefined();
  });

  it('renders Star icon when rating provided', () => {
    render(createElement(MenuItemCard, { item: { ...baseItem, rating: 4.5 } }));
    expect(document.querySelector('[data-testid="star-icon"]')).toBeDefined();
  });
});
