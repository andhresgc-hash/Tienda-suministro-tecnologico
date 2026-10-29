import "./product-card.js";

class ProductList extends HTMLElement {
  constructor() {
    super();
    this._products = [];
  }

  set products(products) {
    if (!Array.isArray(products)) {
      throw new TypeError("Los productos de la lista deben ser un arreglo.");
    }

    this._products = products;
    this.render();
  }

  get products() {
    return this._products;
  }

  render() {
    this.replaceChildren();

    if (this._products.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.textContent = "No hay productos para mostrar.";
      this.append(emptyMessage);
      return;
    }

    const fragment = document.createDocumentFragment();
    this._products.forEach((product) => {
      const productCard = document.createElement("product-card");
      productCard.product = product;
      fragment.append(productCard);
    });
    this.append(fragment);
  }
}

if (!customElements.get("product-list")) {
  customElements.define("product-list", ProductList);
}