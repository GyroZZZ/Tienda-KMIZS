"use client";

import { useState } from "react";

import { useCart } from "@/components/cart/CartProvider";
import type { Product, Size } from "@/lib/products";

export function AddToCart({ product }: { product: Product }) {
  const { addItem } = useCart();
  const availableSizes = product.sizes.filter((item) => item.stock > 0);
  const [size, setSize] = useState<Size | "">(
    availableSizes.find((item) => item.stock >= (product.minQuantity ?? 1))?.size ?? "",
  );
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const [message, setMessage] = useState("");

  const canOrder = product.sizes.some(
    (item) => item.size === size && item.stock >= (product.minQuantity ?? 1),
  );
  const totalStock = product.sizes.reduce((total, item) => total + item.stock, 0);

  function handleAdd() {
    if (!size) return;
    if (addItem(product, size, color)) {
      setMessage("Agregado al carrito.");
    } else {
      setMessage("No hay inventario suficiente para esa talla.");
    }
  }

  return (
    <div className="mt-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Talla
          <select
            value={size}
            onChange={(event) => setSize(event.target.value as Size)}
            className="mt-2 min-h-11 w-full border border-ink/25 bg-bone px-3 font-normal"
          >
            {availableSizes.map((item) => (
              <option
                key={item.size}
                value={item.size}
                disabled={item.stock < (product.minQuantity ?? 1)}
              >
                {item.size}
                {item.stock < (product.minQuantity ?? 1)
                  ? ` — mínimo ${product.minQuantity} para esta talla`
                  : ` · ${item.stock} ${product.type === "personalizada" ? "de capacidad" : "disponibles"}`}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-semibold">
          Color
          <select
            value={color}
            onChange={(event) => setColor(event.target.value)}
            className="mt-2 min-h-11 w-full border border-ink/25 bg-bone px-3 font-normal"
          >
            {product.colors.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-2 text-xs text-ink/50">
        {totalStock === 0
          ? "Sin stock por ahora"
          : product.type === "personalizada"
            ? `${totalStock} unidades de capacidad de producción`
            : `${totalStock} unidades disponibles en total`}
      </p>

      <button
        type="button"
        onClick={handleAdd}
        disabled={!canOrder}
        className="mt-4 min-h-12 w-full bg-ink px-7 py-4 text-sm font-semibold tracking-[0.12em] text-bone uppercase transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        Agregar al carrito
        {product.minQuantity ? ` · Mínimo ${product.minQuantity}` : ""}
      </button>
      <p className="mt-3 min-h-5 text-sm text-ink/70" role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
