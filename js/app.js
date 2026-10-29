import { fetchProducts } from "./api.js";
import "./compones/product-list.js";

async function loadProducts() {
  const productList = document.querySelector("product-list");
  const statusContainer = document.querySelector("#status-container");

  if (!productList || !statusContainer) {
    throw new Error("No se encontraron los elementos del catálogo en la página.");
  }

  statusContainer.textContent = "Cargando productos...";

  try {
    const products = await fetchProducts();
    console.log("Productos cargados:");
    console.table(products);

    productList.products = products;
    statusContainer.textContent = products.length
      ? ""
      : "El catálogo no tiene productos disponibles.";
  } catch (error) {
    console.error("No se pudieron mostrar los productos:", error);
    statusContainer.textContent =
      "No se pudieron cargar los productos. Comprueba que estés usando Live Server y vuelve a intentarlo.";
  }
}

loadProducts();
