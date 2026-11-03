"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

import type { Product, Size } from "@/lib/products";
import { getProductBySlug } from "@/lib/products";

const storageKey = "kmizs-cart-v1";

export interface CartItem {
  slug: string;
  size: Size;
  color: string;
  quantity: number;
}

interface CartSnapshot {
  items: CartItem[];
  ready: boolean;
  storageError: string | null;
}

interface CartContextValue extends CartSnapshot {
  itemCount: number;
  addItem: (product: Product, size: Size, color: string) => boolean;
  removeItem: (slug: string, size: Size, color: string) => void;
  updateQuantity: (slug: string, size: Size, color: string, quantity: number) => void;
  updateSize: (slug: string, oldSize: Size, color: string, newSize: Size) => boolean;
  clearCart: () => void;
}

const emptySnapshot: CartSnapshot = { items: [], ready: false, storageError: null };
let browserSnapshot: CartSnapshot | null = null;
const listeners = new Set<() => void>();
const CartContext = createContext<CartContextValue | null>(null);

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;
  const product = typeof item.slug === "string" ? getProductBySlug(item.slug) : undefined;
  const size =
    product && typeof item.size === "string"
      ? product.sizes.find((entry) => entry.size === item.size)
      : undefined;

  return Boolean(
    product &&
    size &&
    typeof item.color === "string" &&
    product.colors.some((color) => color.name === item.color) &&
    Number.isInteger(item.quantity) &&
    typeof item.quantity === "number" &&
    item.quantity >= (product.minQuantity ?? 1) &&
    item.quantity <= size.stock,
  );
}

function getSnapshot(): CartSnapshot {
  if (typeof window === "undefined") return emptySnapshot;
  if (browserSnapshot) return browserSnapshot;

  try {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) {
      browserSnapshot = { items: [], ready: true, storageError: null };
    } else {
      const parsed: unknown = JSON.parse(saved);
      if (!Array.isArray(parsed) || !parsed.every(isCartItem)) {
        throw new Error("El contenido guardado no tiene el formato esperado.");
      }
      browserSnapshot = { items: parsed, ready: true, storageError: null };
    }
  } catch (error) {
    console.error("No se pudo recuperar el carrito guardado.", error);
    browserSnapshot = {
      items: [],
      ready: true,
      storageError: "No pudimos recuperar el carrito guardado en este dispositivo.",
    };
  }
  return browserSnapshot;
}

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== storageKey && event.key !== null) return;
    browserSnapshot = null;
    notify();
  };
  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function commit(items: CartItem[]) {
  let storageError: string | null = null;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  } catch (error) {
    console.error("No se pudo guardar el carrito en este dispositivo.", error);
    storageError = "No pudimos guardar los cambios del carrito en este dispositivo.";
  }
  browserSnapshot = { items, ready: true, storageError };
  notify();
}

function addItem(product: Product, size: Size, color: string): boolean {
  const stock = product.sizes.find((entry) => entry.size === size)?.stock ?? 0;
  const minimum = product.minQuantity ?? 1;
  if (stock < minimum || !product.colors.some((entry) => entry.name === color)) return false;

  const items = getSnapshot().items;
  const existing = items.find(
    (item) => item.slug === product.slug && item.size === size && item.color === color,
  );
  if (existing && existing.quantity + minimum > stock) return false;
  commit(
    existing
      ? items.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + minimum } : item,
        )
      : [...items, { slug: product.slug, size, color, quantity: minimum }],
  );
  return true;
}

function removeItem(slug: string, size: Size, color: string) {
  commit(
    getSnapshot().items.filter(
      (item) => !(item.slug === slug && item.size === size && item.color === color),
    ),
  );
}

function updateQuantity(slug: string, size: Size, color: string, quantity: number) {
  const product = getProductBySlug(slug);
  const sizeData = product?.sizes.find((entry) => entry.size === size);
  const minimum = product?.minQuantity ?? 1;
  if (!sizeData || !Number.isInteger(quantity) || quantity < minimum || quantity > sizeData.stock) {
    return;
  }

  commit(
    getSnapshot().items.map((item) =>
      item.slug === slug && item.size === size && item.color === color
        ? { ...item, quantity }
        : item,
    ),
  );
}

function updateSize(slug: string, oldSize: Size, color: string, newSize: Size): boolean {
  const product = getProductBySlug(slug);
  const target = product?.sizes.find((entry) => entry.size === newSize);
  const minimum = product?.minQuantity ?? 1;
  const items = getSnapshot().items;
  const item = items.find(
    (entry) => entry.slug === slug && entry.size === oldSize && entry.color === color,
  );
  const collision = items.some(
    (entry) => entry.slug === slug && entry.size === newSize && entry.color === color,
  );

  if (!target || target.stock < minimum || !item || collision || item.quantity > target.stock) {
    return false;
  }
  commit(items.map((entry) => (entry === item ? { ...entry, size: newSize } : entry)));
  return true;
}

function clearCart() {
  commit([]);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => emptySnapshot);
  const value: CartContextValue = {
    ...snapshot,
    itemCount: snapshot.items.reduce((total, item) => total + item.quantity, 0),
    addItem,
    removeItem,
    updateQuantity,
    updateSize,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider.");
  }
  return context;
}
