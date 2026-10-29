const DISCOUNT_THRESHOLD = 300000;
const DISCOUNT_RATE = 0.1;

function assertArrays(cart, catalog) {
  if (!Array.isArray(cart)) {
    throw new TypeError("El carrito debe ser un arreglo.");
  }
  if (!Array.isArray(catalog)) {
    throw new TypeError("El catálogo debe ser un arreglo.");
  }
}

function findAvailableProduct(productId, catalog) {
  const product = catalog.find((item) => item.id === productId);

  if (!product) {
    throw new Error("El producto no existe en el catálogo.");
  }
  if (!product.active || product.stock <= 0) {
    throw new Error("El producto no está disponible.");
  }
  if (!Number.isInteger(product.stock)) {
    throw new Error("El inventario del producto no es válido.");
  }

  return product;
}

function createCartLine(product, quantity) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    description: product.description,
    price: product.price,
    stock: product.stock,
    quantity,
  };
}

export function normalizeCart(cart, catalog) {
  assertArrays(cart, catalog);

  const quantities = new Map();
  cart.forEach((item) => {
    if (
      !item ||
      typeof item.id !== "number" ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    ) {
      return;
    }

    const product = catalog.find((catalogProduct) => catalogProduct.id === item.id);
    if (!product || !product.active || !Number.isInteger(product.stock) || product.stock < 1) {
      return;
    }

    const quantity = (quantities.get(product.id) || 0) + item.quantity;
    quantities.set(product.id, Math.min(quantity, product.stock));
  });

  return Array.from(quantities, ([productId, quantity]) => {
    const product = catalog.find((item) => item.id === productId);
    return createCartLine(product, quantity);
  });
}

export function addToCart(cart, productId, catalog) {
  assertArrays(cart, catalog);
  const currentCart = normalizeCart(cart, catalog);
  const product = findAvailableProduct(productId, catalog);
  const currentLine = currentCart.find((item) => item.id === productId);
  const nextQuantity = (currentLine?.quantity || 0) + 1;

  if (nextQuantity > product.stock) {
    throw new Error(`Solo hay ${product.stock} unidades disponibles.`);
  }

  const updatedCart = currentCart.filter((item) => item.id !== productId);
  updatedCart.push(createCartLine(product, nextQuantity));
  return updatedCart;
}

export function updateCartQuantity(cart, productId, quantity, catalog) {
  assertArrays(cart, catalog);

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("La cantidad debe ser un número entero de al menos 1.");
  }

  const currentCart = normalizeCart(cart, catalog);
  const currentLine = currentCart.find((item) => item.id === productId);
  if (!currentLine) {
    throw new Error("El producto no está en el carrito.");
  }

  const product = findAvailableProduct(productId, catalog);
  if (quantity > product.stock) {
    throw new Error(`Solo hay ${product.stock} unidades disponibles.`);
  }

  return currentCart.map((item) =>
    item.id === productId ? createCartLine(product, quantity) : item
  );
}

export function removeFromCart(cart, productId, catalog) {
  assertArrays(cart, catalog);
  return normalizeCart(cart, catalog).filter((item) => item.id !== productId);
}

export function clearCart() {
  return [];
}

export function getCartSummary(cart, catalog) {
  const items = normalizeCart(cart, catalog);
  const units = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const discount = subtotal >= DISCOUNT_THRESHOLD ? subtotal * DISCOUNT_RATE : 0;

  return {
    items,
    units,
    subtotal,
    discount,
    total: subtotal - discount,
  };
}

export function createOrder(cart, catalog) {
  const summary = getCartSummary(cart, catalog);
  if (summary.items.length === 0) {
    throw new Error("No se puede confirmar un pedido con el carrito vacío.");
  }

  return {
    id: `TS-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...summary,
  };
}