import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '@/lib/cart-context';

describe('Cart Context', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CartProvider>{children}</CartProvider>
  );

  it('should initialize with empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toHaveLength(0);
    expect(result.current.count).toBe(0);
    expect(result.current.subtotal).toBe(0);
  });

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const testItem = { id: 1, name: 'Test Product', price: 10, qty: 2, image: '' };

    act(() => {
      result.current.addItem(testItem);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject(testItem);
    expect(result.current.count).toBe(2);
    expect(result.current.subtotal).toBe(20);
  });

  it('should update quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const testItem = { id: 1, name: 'Test Product', price: 10, qty: 1, image: '' };

    act(() => {
      result.current.addItem(testItem);
      result.current.updateQty(1, 2); // Increase by 2
    });

    expect(result.current.items[0].qty).toBe(3);
    expect(result.current.count).toBe(3);
    expect(result.current.subtotal).toBe(30);
  });

  it('should not allow quantity below 1', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const testItem = { id: 1, name: 'Test Product', price: 10, qty: 1, image: '' };

    act(() => {
      result.current.addItem(testItem);
      result.current.updateQty(1, -5); // Try to decrease by 5
    });

    expect(result.current.items[0].qty).toBe(1); // Should stay at 1
  });

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const testItem = { id: 1, name: 'Test Product', price: 10, qty: 2, image: '' };

    act(() => {
      result.current.addItem(testItem);
      result.current.removeItem(1);
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.count).toBe(0);
    expect(result.current.subtotal).toBe(0);
  });

  it('should clear cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const testItem1 = { id: 1, name: 'Product 1', price: 10, qty: 1, image: '' };
    const testItem2 = { id: 2, name: 'Product 2', price: 20, qty: 3, image: '' };

    act(() => {
      result.current.addItem(testItem1);
      result.current.addItem(testItem2);
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.count).toBe(0);
    expect(result.current.subtotal).toBe(0);
  });

  it('should throw when useCart used outside provider', () => {
    // Suppress console.error for expected error
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() =>
      renderHook(() => useCart(), {
        wrapper: ({ children }) => children, // No provider
      })
    ).toThrow('useCart must be used within a CartProvider');
    
    spy.mockRestore();
  });
});