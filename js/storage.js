const CART_KEY = "tecnostock_card";

export function saveCartToStorage(cart) {
  if (!Array.isArray(cart)) {
    throw new TypeError("El carrito debe ser un arreglo.");
  }

  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Error al guardar el carrito en localStorage:", error);
    throw error;
  }
}

export function saveCarToStorage(cart) {
  return saveCartToStorage(cart);
}

export function loadCartFromStorage(catalog) {
  if (!Array.isArray(catalog)) {
    throw new TypeError("El catálogo debe ser un arreglo.");
  }

  try {
    const storedCart = localStorage.getItem(CART_KEY);
    if (!storedCart) return [];

    const parsedCart = JSON.parse(storedCart);
    if (!Array.isArray(parsedCart)) {
      throw new Error("El carrito guardado no tiene un formato válido.");
    }

    return parsedCart.reduce((cart, item) => {
      if (
        !item ||
        typeof item.id !== "number" ||
        typeof item.quantity !== "number" ||
        !Number.isFinite(item.quantity) ||
        item.quantity <= 0
      ) {
        return cart;
      }

      const product = catalog.find((catalogProduct) => catalogProduct.id === item.id);
      if (!product || !product.active || product.stock <= 0) {
        return cart;
      }

      cart.push({
        ...item,
        quantity: Math.min(item.quantity, product.stock),
      });
      return cart;
    }, []);
  } catch (error) {
    console.error("Error al cargar el carrito desde localStorage:", error);
    throw error;
  }
}
