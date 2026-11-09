"use client";

import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/components/cart/CartProvider";
import { formatPrice, getProductBySlug } from "@/lib/products";
import type { Size } from "@/lib/products";

export function CartContents() {
  const { items, ready, storageError, removeItem, updateQuantity, updateSize } = useCart();

  if (!ready) {
    return <p className="mt-8 text-sm text-ink/60">Cargando tu carrito…</p>;
  }

  if (items.length === 0) {
    return (
      <>
        {storageError ? (
          <p role="alert" className="mt-8 border border-accent/40 bg-accent/5 p-4 text-sm">
            {storageError}
          </p>
        ) : null}
        <div className="mt-8 border border-ink/15 bg-bone-dim/40 p-8 text-center sm:p-12">
          <p className="font-display text-2xl tracking-tight">Todavía está vacío</p>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink/65">
            Explora el catálogo, elige talla y agrega tus camisetas. El carrito se conserva en este
            dispositivo.
          </p>
          <Link
            href="/productos"
            className="mt-7 inline-flex min-h-11 items-center justify-center bg-ink px-6 py-3 text-sm font-semibold tracking-[0.12em] text-bone uppercase transition-colors hover:bg-accent"
          >
            Ver camisetas
          </Link>
        </div>
      </>
    );
  }

  const subtotal = items.reduce((total, item) => {
    const product = getProductBySlug(item.slug);
    return total + (product?.price ?? 0) * item.quantity;
  }, 0);

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_19rem]">
      <div>
        {storageError ? (
          <p role="alert" className="mb-5 border border-accent/40 bg-accent/5 p-4 text-sm">
            {storageError}
          </p>
        ) : null}
        <ul className="divide-y divide-ink/15 border-y border-ink/15">
          {items.map((item) => {
            const product = getProductBySlug(item.slug);
            if (!product) return null;
            const minQuantity = product.minQuantity ?? 1;
            const sizeStock = product.sizes.find((entry) => entry.size === item.size)?.stock ?? 0;

            return (
              <li
                key={`${item.slug}-${item.size}-${item.color}`}
                className="grid grid-cols-[5.5rem_1fr] gap-4 py-5 sm:grid-cols-[7rem_1fr]"
              >
                <Link
                  href={`/productos/${product.slug}`}
                  className="relative aspect-4/5 overflow-hidden bg-bone-dim"
                  aria-label={`Ver ${product.name}`}
                >
                  <Image
                    src={product.image.src}
                    alt={product.image.alt}
                    fill
                    sizes="(min-width: 640px) 112px, 88px"
                    className="object-cover"
                  />
                </Link>
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/productos/${product.slug}`}
                        className="font-display text-lg tracking-tight hover:text-accent"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 text-sm text-ink/60">
                        {item.color} · {formatPrice(product.price)} c/u
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold">
                      {formatPrice(product.price * item.quantity)}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-end gap-3">
                    <label className="text-xs font-semibold tracking-wide uppercase">
                      Talla
                      <select
                        value={item.size}
                        onChange={(event) =>
                          updateSize(item.slug, item.size, item.color, event.target.value as Size)
                        }
                        className="mt-1 block min-h-10 border border-ink/25 bg-bone px-2 text-sm font-normal normal-case"
                      >
                        {product.sizes
                          .filter((entry) => entry.stock >= Math.max(minQuantity, item.quantity))
                          .map((entry) => (
                            <option key={entry.size} value={entry.size}>
                              {entry.size}
                            </option>
                          ))}
                      </select>
                    </label>

                    <div>
                      <span className="block text-xs font-semibold tracking-wide uppercase">
                        Cantidad
                      </span>
                      <div className="mt-1 flex min-h-10 items-center border border-ink/25">
                        <button
                          type="button"
                          aria-label={`Reducir cantidad de ${product.name}`}
                          disabled={item.quantity <= minQuantity}
                          onClick={() =>
                            updateQuantity(item.slug, item.size, item.color, item.quantity - 1)
                          }
                          className="min-h-10 min-w-10 disabled:opacity-30"
                        >
                          −
                        </button>
                        <span className="min-w-8 text-center text-sm" aria-live="polite">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Aumentar cantidad de ${product.name}`}
                          disabled={item.quantity >= sizeStock}
                          onClick={() =>
                            updateQuantity(item.slug, item.size, item.color, item.quantity + 1)
                          }
                          className="min-h-10 min-w-10 disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.slug, item.size, item.color)}
                      className="min-h-10 px-2 text-xs font-semibold tracking-wide text-ink/60 underline underline-offset-4 hover:text-accent"
                    >
                      Quitar
                    </button>
                  </div>
                  {product.minQuantity ? (
                    <p className="mt-2 text-xs text-ink/55">
                      Cantidad mínima para este diseño: {product.minQuantity}.
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <aside className="h-fit border border-ink/15 bg-bone-dim/40 p-5 sm:p-6">
        <h2 className="text-xl tracking-tight">Resumen</h2>
        <div className="mt-5 flex justify-between gap-4 text-sm">
          <span>Subtotal ({items.reduce((count, item) => count + item.quantity, 0)} prendas)</span>
          <span className="font-semibold">{formatPrice(subtotal)}</span>
        </div>
        <div className="mt-3 flex justify-between gap-4 text-sm text-ink/65">
          <span>Envío</span>
          <span>Por confirmar</span>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-ink/60">
          Te confirmaremos tarifa y plazo antes de cobrar o despachar el pedido.
        </p>
        <Link
          href="/checkout"
          className="mt-6 flex min-h-12 items-center justify-center bg-ink px-5 py-3 text-center text-sm font-semibold tracking-[0.12em] text-bone uppercase transition-colors hover:bg-accent"
        >
          Continuar al checkout
        </Link>
        <Link
          href="/productos"
          className="mt-4 block text-center text-sm underline decoration-accent underline-offset-4"
        >
          Seguir comprando
        </Link>
      </aside>
    </div>
  );
}
