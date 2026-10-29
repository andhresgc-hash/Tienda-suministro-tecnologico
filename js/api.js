export async function fetchProducts() {
  const response = await fetch("./data/products.json");

  if (!response.ok) {
    throw new Error(`Error al cargar productos: ${response.status} ${response.statusText}`);
  }

  const products = await response.json();

  if (!Array.isArray(products)) {
    throw new Error("El catálogo debe ser un arreglo de productos.");
  }

  const invalidProduct = products.find(
    (product) =>
      !product ||
      typeof product.id !== "number" ||
      typeof product.name !== "string" ||
      typeof product.category !== "string" ||
      typeof product.price !== "number" ||
      !Number.isFinite(product.price) ||
      product.price < 0 ||
      typeof product.stock !== "number" ||
      !Number.isFinite(product.stock) ||
      product.stock < 0 ||
      typeof product.description !== "string" ||
      typeof product.active !== "boolean"
  );

  if (invalidProduct) {
    throw new Error("Hay un producto con datos inválidos en el catálogo.");
  }

  return products;
}
