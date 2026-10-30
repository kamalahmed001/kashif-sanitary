import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('kss_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);

  useEffect(() => {
    localStorage.setItem('kss_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, selectedVariant, quantity = 1) => {
    setItems((prevItems) => {
      // Find existing item matching product ID and variant
      const existingIndex = prevItems.findIndex(
        (it) => it.product_id === product.id && it.variant === selectedVariant
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        const newItem = {
          product_id: product.id,
          product_name_en: product.name_en,
          product_name_ur: product.name_ur,
          variant: selectedVariant || '',
          unit: product.unit || 'Piece',
          quantity,
          unit_price: product.price || 0,
          is_price_on_request: product.is_price_on_request ? 1 : 0,
          image_url: product.image_url,
        };
        return [...prevItems, newItem];
      }
    });
  };

  const updateQuantity = (index, newQty) => {
    if (newQty <= 0) {
      removeFromCart(index);
      return;
    }
    setItems((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index].quantity = newQty;
      }
      return updated;
    });
  };

  const removeFromCart = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const estimatedTotal = items.reduce(
    (sum, item) => sum + (item.is_price_on_request ? 0 : item.unit_price * item.quantity),
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalCount,
        estimatedTotal,
        isDrawerOpen,
        setIsDrawerOpen,
        submittedOrder,
        setSubmittedOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
