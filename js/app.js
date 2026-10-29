import { fetchProducts } from "./api.js";

async function showProductsInConsole() {
  try {
    const products = await fetchProducts();
    console.log("Productos cargados:");
    console.table(products);
  } catch (error) {
    console.error("No se pudieron mostrar los productos:", error);
  }
}

showProductsInConsole();
