import { CatalogError, fetchProducts } from "./api.js";
import {
  addToCart,
  clearCart,
  createOrder,
  normalizeCart,
  removeFromCart,
  updateCartQuantity,
} from "./card.js";
import { loadCartFromStorage, saveCartToStorage } from "./storage.js";
import "./compones/product-list.js";
import "./compones/shopping-card.js";

let catalog = [];
let cart = [];
let orderNumberInMemory = 0;

const productList = document.querySelector("product-list");
const shoppingCart = document.querySelector("shopping-cart");
const statusContainer = document.querySelector("#status-container");
const cartBadge = document.querySelector("#cart-badge");
const searchInput = document.querySelector("#search-input");
const categorySelect = document.querySelector("#category-select");
const availableCheckbox = document.querySelector("#only-available");
const sortSelect = document.querySelector("#sort-select");

function showStatus(message, type = "info") {
  statusContainer.textContent = message;
  statusContainer.dataset.type = type;
}

function renderCatalog() {
  const search = searchInput.value.trim().toLocaleLowerCase();
  const category = categorySelect.value;
  const onlyAvailable = availableCheckbox.checked;
  const sortOrder = sortSelect.value;

  const filteredProducts = catalog.filter((product) => {
    const matchesSearch =
      product.name.toLocaleLowerCase().includes(search) ||
      product.description.toLocaleLowerCase().includes(search);
    const matchesCategory = !category || product.category === category;
    const matchesAvailability =
      !onlyAvailable || (product.active && product.stock > 0);

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  if (sortOrder === "asc") {
    filteredProducts.sort((first, second) => first.price - second.price);
  } else if (sortOrder === "desc") {
    filteredProducts.sort((first, second) => second.price - first.price);
  }

  productList.products = filteredProducts;
}

function renderCart() {
  const summary = normalizeCart(cart, catalog);
  cart = summary;
  shoppingCart.items = cart;

  const units = cart.reduce((total, item) => total + item.quantity, 0);
  cartBadge.textContent = `${units} ${units === 1 ? "unidad" : "unidades"}`;
}

function commitCart(nextCart, successMessage = "") {
  cart = normalizeCart(nextCart, catalog);
  renderCart();

  try {
    saveCartToStorage(cart);
    showStatus(successMessage, successMessage ? "success" : "info");
    return true;
  } catch (error) {
    console.error("No se pudo guardar el carrito:", error);
    showStatus("El carrito se actualizó, pero no se pudo guardar en este navegador.", "error");
    return false;
  }
}

function populateCategories() {
  const categories = [...new Set(catalog.map((product) => product.category))].sort();
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.append(option);
  });
}

function getNextOrderId() {
  const orderNumberKey = "tecnostock_order_number";
  let nextNumber = orderNumberInMemory + 1;

  try {
    const storedNumber = Number(localStorage.getItem(orderNumberKey) || 0);
    if (Number.isSafeInteger(storedNumber) && storedNumber >= 0) {
      nextNumber = Math.max(storedNumber, orderNumberInMemory) + 1;
    }
  } catch (error) {
    console.error("No se pudo leer el contador de pedidos guardado:", error);
  }

  orderNumberInMemory = nextNumber;

  try {
    localStorage.setItem(orderNumberKey, String(nextNumber));
  } catch (error) {
    console.error("No se pudo guardar el contador de pedidos:", error);
  }

  return `Pedido #${String(nextNumber).padStart(3, "0")}`;
}

productList.addEventListener("add-to-cart", (event) => {
  try {
    commitCart(addToCart(cart, event.detail.productId, catalog), "Producto agregado al carrito.");
  } catch (error) {
    showStatus(error.message, "error");
  }
});

shoppingCart.addEventListener("cart-quantity-change", (event) => {
  try {
    const { productId, quantity } = event.detail;
    commitCart(updateCartQuantity(cart, productId, quantity, catalog));
  } catch (error) {
    showStatus(error.message, "error");
  }
});

shoppingCart.addEventListener("cart-remove", (event) => {
  try {
    commitCart(removeFromCart(cart, event.detail.productId, catalog), "Producto eliminado del carrito.");
  } catch (error) {
    showStatus(error.message, "error");
  }
});

shoppingCart.addEventListener("cart-clear", () => {
  commitCart(clearCart(), "Carrito vaciado.");
});

shoppingCart.addEventListener("order-confirm", () => {
  try {
    const order = createOrder(cart, catalog);
    order.id = getNextOrderId();
    const currency = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    });

    const details = order.items
      .map(
        (item) =>
          `${item.name} x ${item.quantity} = ${currency.format(item.price * item.quantity)}`
      )
      .join("\n");
    const confirmation = [
      "FACTURA - TECNOSTOCK",
      `Pedido: ${order.id}`,
      "",
      details,
      "",
      `Subtotal: ${currency.format(order.subtotal)}`,
      order.discount > 0
        ? `Descuento del 10%: -${currency.format(order.discount)}`
        : `Descuento: ${currency.format(order.discount)} (aplica desde $300.000)`,
      `Total: ${currency.format(order.total)}`,
      "",
      "Factura simulada; no se realizó ningún pago.",
    ].join("\n");

    window.alert(confirmation);
    commitCart(clearCart(), `Pedido ${order.id} confirmado como simulación.`);
  } catch (error) {
    showStatus(error.message, "error");
  }
});

searchInput.addEventListener("input", renderCatalog);
categorySelect.addEventListener("change", renderCatalog);
availableCheckbox.addEventListener("change", renderCatalog);
sortSelect.addEventListener("change", renderCatalog);

document.querySelector("#clear-filters-btn").addEventListener("click", () => {
  searchInput.value = "";
  categorySelect.value = "";
  availableCheckbox.checked = false;
  sortSelect.value = "";
  renderCatalog();
  showStatus("Filtros limpiados.", "success");
});

async function initializeStore() {
  showStatus("Cargando productos...");

  try {
    catalog = await fetchProducts();
    populateCategories();
    cart = loadCartFromStorage(catalog);
    renderCatalog();
    renderCart();

    showStatus(
      catalog.length ? "" : "El catálogo no tiene productos disponibles.",
      catalog.length ? "info" : "warning"
    );
  } catch (error) {
    console.error("No se pudo iniciar la tienda:", error);
    if (error instanceof CatalogError) {
      const messages = {
        http: "El servidor respondió con un error al consultar el catálogo.",
        data: "El catálogo contiene datos inválidos y no se puede mostrar.",
        network: "No fue posible conectar con el servidor. Inicia Live Server e inténtalo de nuevo.",
      };
      showStatus(messages[error.kind] || error.message, "error");
      return;
    }

    showStatus("Ocurrió un error inesperado al iniciar la tienda.", "error");
  }
}

initializeStore();
