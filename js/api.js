export class CatalogError extends Error {
  constructor(kind, message) {
    super(message);
    this.name = "CatalogError";
    this.kind = kind;
  }
}

export async function fetchProducts() {
  let response;
  try {
    response = await fetch("./data/products.json");
  } catch (error) {
    throw new CatalogError(
      "network",
      "No se pudo conectar para consultar el catálogo."
    );
  }

  if (!response.ok) {
    throw new CatalogError(
      "http",
      `Error HTTP al cargar productos: ${response.status} ${response.statusText}`
    );
  }

  let products;
  try {
    products = await response.json();
  } catch (error) {
    throw new CatalogError(
      "data",
      "La respuesta del catálogo no contiene un JSON válido."
    );
  }

  if (!Array.isArray(products)) {
    throw new CatalogError(
      "data",
      "El catálogo debe ser un arreglo de productos."
    );
  }

  const productIds = new Set();
  for (const product of products) {
    const invalidProduct =
      !product ||
      typeof product.id !== "number" ||
      !Number.isFinite(product.id) ||
      typeof product.name !== "string" ||
      typeof product.category !== "string" ||
      typeof product.price !== "number" ||
      !Number.isFinite(product.price) ||
      product.price <= 0 ||
      typeof product.stock !== "number" ||
      !Number.isInteger(product.stock) ||
      product.stock < 0 ||
      typeof product.description !== "string" ||
      typeof product.active !== "boolean";

    if (invalidProduct) {
      throw new CatalogError(
        "data",
        "Hay un producto con datos inválidos en el catálogo."
      );
    }

    if (productIds.has(product.id)) {
      throw new CatalogError(
        "data",
        `El identificador ${product.id} está repetido en el catálogo.`
      );
    }
    productIds.add(product.id);
  }

  return products;
}
