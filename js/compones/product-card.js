class ProductCard extends HTMLElement {
  constructor() {
    super();
    this._product = null;
  }

  set product(product) {
    this._product = product;
    this.render();
  }

  get product() {
    return this._product;
  }

  render() {
    this.replaceChildren();
    const product = this._product;
    if (!product) return;

    const card = document.createElement("article");
    card.style.cssText =
      "height:100%; box-sizing:border-box; padding:1rem; border:1px solid #d1d5db; border-radius:8px; background:#fff;";

    const title = document.createElement("h3");
    title.textContent = product.name;

    const category = document.createElement("p");
    category.textContent = `Categoría: ${product.category}`;

    const description = document.createElement("p");
    description.textContent = product.description;

    const price = document.createElement("p");
    price.textContent = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(product.price);

    const stock = document.createElement("p");
    const available = product.active && product.stock > 0;
    stock.textContent = available
      ? `Disponibles: ${product.stock}`
      : "Producto no disponible";

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.textContent = "Agregar al carrito";
    addButton.disabled = !available;
    addButton.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("add-to-cart", {
          detail: { productId: product.id },
          bubbles: true,
          composed: true,
        })
      );
    });

    card.append(title, category, description, price, stock, addButton);
    this.append(card);
  }
}

if (!customElements.get("product-card")) {
  customElements.define("product-card", ProductCard);
}