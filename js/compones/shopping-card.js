const DISCOUNT_THRESHOLD = 300000;
const DISCOUNT_RATE = 0.1;

class ShoppingCard extends HTMLElement {
  constructor() {
    super();
    this._items = [];
  }

  set items(items) {
    if (!Array.isArray(items)) {
      throw new TypeError("Los productos del carrito deben ser un arreglo.");
    }

    this._items = items;
    this.render();
  }

  get items() {
    return this._items;
  }

  render() {
    this.replaceChildren();

    const heading = document.createElement("h2");
    heading.textContent = "Carrito de compras";
    this.append(heading);

    const lines = document.createElement("div");
    let units = 0;
    let subtotal = 0;

    if (this._items.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.textContent = "Tu carrito está vacío.";
      lines.append(emptyMessage);
    } else {
      this._items.forEach((item) => {
        const lineSubtotal = item.price * item.quantity;
        units += item.quantity;
        subtotal += lineSubtotal;

        const line = document.createElement("article");
        line.style.cssText =
          "padding:0.75rem 0; border-bottom:1px solid #d1d5db;";

        const name = document.createElement("h3");
        name.textContent = item.name;

        const price = document.createElement("p");
        price.textContent = `${this.formatCurrency(item.price)} c/u`;

        const controls = document.createElement("div");
        controls.style.cssText = "display:flex; align-items:center; gap:0.5rem;";

        const decreaseButton = document.createElement("button");
        decreaseButton.type = "button";
        decreaseButton.textContent = "-";
        decreaseButton.setAttribute("aria-label", `Disminuir cantidad de ${item.name}`);
        decreaseButton.disabled = item.quantity <= 1;
        decreaseButton.addEventListener("click", () => {
          this.dispatchCartEvent("cart-quantity-change", {
            productId: item.id,
            quantity: item.quantity - 1,
          });
        });

        const quantity = document.createElement("span");
        quantity.textContent = String(item.quantity);
        quantity.setAttribute("aria-label", "Cantidad");

        const increaseButton = document.createElement("button");
        increaseButton.type = "button";
        increaseButton.textContent = "+";
        increaseButton.setAttribute("aria-label", `Aumentar cantidad de ${item.name}`);
        increaseButton.disabled = item.quantity >= item.stock;
        increaseButton.addEventListener("click", () => {
          this.dispatchCartEvent("cart-quantity-change", {
            productId: item.id,
            quantity: item.quantity + 1,
          });
        });

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.textContent = "Eliminar";
        removeButton.addEventListener("click", () => {
          this.dispatchCartEvent("cart-remove", { productId: item.id });
        });

        controls.append(decreaseButton, quantity, increaseButton, removeButton);

        const lineTotal = document.createElement("p");
        lineTotal.textContent = `Subtotal: ${this.formatCurrency(lineSubtotal)}`;

        line.append(name, price, controls, lineTotal);
        lines.append(line);
      });
    }

    const discount = subtotal >= DISCOUNT_THRESHOLD ? subtotal * DISCOUNT_RATE : 0;
    const total = subtotal - discount;
    const summary = document.createElement("section");
    summary.setAttribute("aria-label", "Resumen del carrito");

    const unitsText = document.createElement("p");
    unitsText.textContent = `Unidades: ${units}`;

    const subtotalText = document.createElement("p");
    subtotalText.textContent = `Subtotal: ${this.formatCurrency(subtotal)}`;

    const discountText = document.createElement("p");
    discountText.textContent = `Descuento: ${this.formatCurrency(discount)}`;

    const totalText = document.createElement("p");
    totalText.textContent = `Total: ${this.formatCurrency(total)}`;

    summary.append(unitsText, subtotalText, discountText, totalText);

    if (this._items.length > 0) {
      const clearButton = document.createElement("button");
      clearButton.type = "button";
      clearButton.textContent = "Vaciar carrito";
      clearButton.addEventListener("click", () => {
        this.dispatchCartEvent("cart-clear", {});
      });

      const confirmButton = document.createElement("button");
      confirmButton.type = "button";
      confirmButton.textContent = "Confirmar pedido";
      confirmButton.addEventListener("click", () => {
        this.dispatchCartEvent("order-confirm", {
          lines: this._items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
          subtotal,
          discount,
          total,
        });
      });

      summary.append(clearButton, confirmButton);
    }

    this.append(lines, summary);
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  dispatchCartEvent(eventName, detail) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }
}

if (!customElements.get("shopping-cart")) {
  customElements.define("shopping-cart", ShoppingCard);
}