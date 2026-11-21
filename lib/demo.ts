import "server-only";

/**
 * Datos de las cuentas de demostración. Se importan solo desde componentes de
 * servidor y se pasan al navegador como props explícitas; nunca se exponen como
 * módulo compartido con Client Components.
 */

export const DEMO_ACCOUNT = {
  name: "Usuario Demo",
  email: "demo@kmizs.test",
  password: "Demo2026!Kmizs",
};

export const MP_DEMO = {
  email: "test_user_8164834918474591249@testuser.com",
  password: "5iXYGLbhoY",
  loginUrl: "https://www.mercadopago.com.co/login",
  cards: [
    { result: "Aprobado", card: "Mastercard terminada en 3564", holder: "APRO" },
    { result: "Rechazado", card: "Visa terminada en 6260", holder: "OTHE" },
    { result: "Pendiente", card: "Visa Débito terminada en 1904", holder: "CONT" },
  ],
};
