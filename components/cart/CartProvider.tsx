"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

import type { Product, Size } from "@/lib/products";

const storageKey = "kmizs-cart-v1";

type Catalog = Map<string, Product>;

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
  getProduct: (slug: string) => Product | undefined;
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

function isStoredItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;
  return (
    typeof item.slug === "string" &&
    typeof item.size === "string" &&
    typeof item.color === "string" &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  );
}

/**
 * Comprueba la línea contra el catálogo vigente.
 *
 * El catálogo llega por props desde el layout (lectura cacheada en el servidor),
 * así que el carrito puede validar tallas y stock sin volver a descargarlo ni
 * duplicarlo en cada componente.
 */
function isAvailable(item: CartItem, catalog: Catalog): boolean {
  const product = catalog.get(item.slug);
  if (!product) return false;

  const size = product.sizes.find((entry) => entry.size === item.size);
  return Boolean(
    size &&
    product.colors.some((color) => color.name === item.color) &&
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
      if (!Array.isArray(parsed) || !parsed.every(isStoredItem)) {
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

function addToCart(catalog: Catalog, product: Product, size: Size, color: string): boolean {
  const stock = product.sizes.find((entry) => entry.size === size)?.stock ?? 0;
  const minimum = product.minQuantity ?? 1;
  if (stock < minimum || !product.colors.some((entry) => entry.name === color)) return false;
  if (!isAvailable({ slug: product.slug, size, color, quantity: minimum }, catalog)) return false;

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

function removeFromCart(slug: string, size: Size, color: string) {
  commit(
    getSnapshot().items.filter(
      (item) => !(item.slug === slug && item.size === size && item.color === color),
    ),
  );
}

function changeQuantity(catalog: Catalog, slug: string, size: Size, color: string, quantity: number) {
  const product = catalog.get(slug);
  const sizeData = product?.sizes.find((entry) => entry.size === size);
  const minimum = product?.minQuantity ?? 1;
  if (!sizeData || !Number.isInteger(quantity) || quantity < minimum || quantity > sizeData.stock) {
    return;
  }

  const items = getSnapshot().items;
  const item = items.find(
    (entry) => entry.slug === slug && entry.size === size && entry.color === color,
  );
  if (!item) return;

  commit(items.map((entry) => (entry === item ? { ...entry, quantity } : entry)));
}

function changeSize(
  catalog: Catalog,
  slug: string,
  oldSize: Size,
  color: string,
  newSize: Size,
): boolean {
  const product = catalog.get(slug);
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

function clearStoredCart() {
  commit([]);
}

export function CartProvider({
  products,
  children,
}: {
  products: Product[];
  children: React.ReactNode;
}) {
  const catalog = useMemo(
    () => new Map(products.map((product) => [product.slug, product])),
    [products],
  );
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => emptySnapshot);

  const { items, stale } = useMemo(() => {
    const available = snapshot.items.filter((item) => isAvailable(item, catalog));
    return { items: available, stale: available.length !== snapshot.items.length };
  }, [snapshot.items, catalog]);

  // Si el catálogo cambió (talla agotada, referencia retirada), se limpia lo
  // que ya no se puede comprar para que el carrito no guarde líneas muertas.
  useEffect(() => {
    if (snapshot.ready && stale) commit(items);
  }, [snapshot.ready, stale, items]);

  const getProduct = useCallback((slug: string) => catalog.get(slug), [catalog]);
  const addItem = useCallback(
    (product: Product, size: Size, color: string) => addToCart(catalog, product, size, color),
    [catalog],
  );
  const updateSize = useCallback(
    (slug: string, oldSize: Size, color: string, newSize: Size) =>
      changeSize(catalog, slug, oldSize, color, newSize),
    [catalog],
  );
  const updateQuantity = useCallback(
    (slug: string, size: Size, color: string, quantity: number) =>
      changeQuantity(catalog, slug, size, color, quantity),
    [catalog],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      ready: snapshot.ready,
      storageError: snapshot.storageError,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      getProduct,
      addItem,
      removeItem: removeFromCart,
      updateQuantity,
      updateSize,
      clearCart: clearStoredCart,
    }),
    [items, snapshot.ready, snapshot.storageError, getProduct, addItem, updateQuantity, updateSize],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider.");
  }
  return context;
}
