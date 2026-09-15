import { describe, expect, it } from "vitest";
import {
  ESTADO_INICIAL,
  comentarioValido,
  enlaceValido,
  estadoValidoParaTipo,
  fechaValida,
  importeValido,
  normalizarCantidad,
  notaValida,
  ordenValido,
  tipoContenidoValido,
} from "./items";

describe("estadoValidoParaTipo", () => {
  it("acepta los estados propios de cada tipo", () => {
    expect(estadoValidoParaTipo("COMPRA", "A_COMPRAR")).toBe(true);
    expect(estadoValidoParaTipo("COMPRA", "COMPRADO")).toBe(true);
    expect(estadoValidoParaTipo("CASA", "URGENTE")).toBe(true);
    expect(estadoValidoParaTipo("PELISERIE", "EN_CURSO")).toBe(true);
    expect(estadoValidoParaTipo("TAREA", "HECHO")).toBe(true);
    expect(estadoValidoParaTipo("DEUDA", "PENDIENTE")).toBe(true);
    expect(estadoValidoParaTipo("RESTAURANTE", "HECHO")).toBe(true);
  });

  it("rechaza estados de otro tipo de lista", () => {
    expect(estadoValidoParaTipo("COMPRA", "URGENTE")).toBe(false);
    expect(estadoValidoParaTipo("CASA", "A_COMPRAR")).toBe(false);
    expect(estadoValidoParaTipo("RESTAURANTE", "EN_CURSO")).toBe(false);
    expect(estadoValidoParaTipo("TAREA", "URGENTE")).toBe(false);
  });

  it("rechaza cualquier texto que no sea un EstadoItem real", () => {
    expect(estadoValidoParaTipo("COMPRA", "")).toBe(false);
    expect(estadoValidoParaTipo("COMPRA", "COMPRADISIMO")).toBe(false);
  });

  it("ESTADO_INICIAL de cada tipo es siempre un estado válido para ese tipo", () => {
    (Object.keys(ESTADO_INICIAL) as (keyof typeof ESTADO_INICIAL)[]).forEach((tipo) => {
      expect(estadoValidoParaTipo(tipo, ESTADO_INICIAL[tipo])).toBe(true);
    });
  });
});

describe("tipoContenidoValido", () => {
  it("acepta PELICULA y SERIE", () => {
    expect(tipoContenidoValido("PELICULA")).toBe(true);
    expect(tipoContenidoValido("SERIE")).toBe(true);
  });

  it("rechaza cualquier otro valor", () => {
    expect(tipoContenidoValido("DOCUMENTAL")).toBe(false);
    expect(tipoContenidoValido("")).toBe(false);
    expect(tipoContenidoValido(null)).toBe(false);
    expect(tipoContenidoValido(undefined)).toBe(false);
    expect(tipoContenidoValido(1)).toBe(false);
  });
});

describe("normalizarCantidad", () => {
  it("devuelve el entero tal cual si es válido", () => {
    expect(normalizarCantidad(1)).toBe(1);
    expect(normalizarCantidad(5)).toBe(5);
    expect(normalizarCantidad("3")).toBe(3);
  });

  it("cae a 1 con cero, negativos, decimales o basura", () => {
    expect(normalizarCantidad(0)).toBe(1);
    expect(normalizarCantidad(-4)).toBe(1);
    expect(normalizarCantidad(2.5)).toBe(1);
    expect(normalizarCantidad("nope")).toBe(1);
    expect(normalizarCantidad(null)).toBe(1);
    expect(normalizarCantidad(undefined)).toBe(1);
  });
});

describe("enlaceValido", () => {
  it("acepta http y https", () => {
    expect(enlaceValido("https://ejemplo.com")).toBe(true);
    expect(enlaceValido("http://ejemplo.com/ruta?x=1")).toBe(true);
    expect(enlaceValido("  https://ejemplo.com  ")).toBe(true);
  });

  it("rechaza cualquier otra cosa", () => {
    expect(enlaceValido("ejemplo.com")).toBe(false);
    expect(enlaceValido("ftp://ejemplo.com")).toBe(false);
    expect(enlaceValido("")).toBe(false);
    expect(enlaceValido("   ")).toBe(false);
    expect(enlaceValido("javascript:alert(1)")).toBe(false);
  });
});

describe("importeValido", () => {
  it("redondea a 2 decimales", () => {
    expect(importeValido(10)).toBe(10);
    expect(importeValido("12.345")).toBe(12.35);
    expect(importeValido(1.005)).toBeCloseTo(1, 2);
  });

  it("rechaza cero, negativos y valores no numéricos", () => {
    expect(importeValido(0)).toBeNull();
    expect(importeValido(-5)).toBeNull();
    expect(importeValido("gratis")).toBeNull();
    expect(importeValido(null)).toBeNull();
    expect(importeValido(undefined)).toBeNull();
    expect(importeValido(Infinity)).toBeNull();
  });
});

describe("fechaValida", () => {
  it("acepta YYYY-MM-DD y un ISO completo", () => {
    expect(fechaValida("2026-01-15")).toBeInstanceOf(Date);
    expect(fechaValida("2026-01-15T10:30:00.000Z")).toBeInstanceOf(Date);
  });

  it("rechaza vacío, no-string y fechas imposibles", () => {
    expect(fechaValida("")).toBeNull();
    expect(fechaValida(undefined)).toBeNull();
    expect(fechaValida(null)).toBeNull();
    expect(fechaValida(12345)).toBeNull();
    expect(fechaValida("no es una fecha")).toBeNull();
  });
});

describe("ordenValido", () => {
  it("acepta cualquier número finito, incluyendo negativos y decimales", () => {
    expect(ordenValido(0)).toBe(0);
    expect(ordenValido(-3.5)).toBe(-3.5);
    expect(ordenValido("2")).toBe(2);
  });

  it("rechaza valores no finitos", () => {
    expect(ordenValido("no numero")).toBeNull();
    expect(ordenValido(Infinity)).toBeNull();
    expect(ordenValido(NaN)).toBeNull();
    expect(ordenValido(undefined)).toBeNull();
  });
});

describe("notaValida", () => {
  it("acepta enteros entre 1 y 10", () => {
    expect(notaValida(1)).toBe(1);
    expect(notaValida(10)).toBe(10);
    expect(notaValida("7")).toBe(7);
  });

  it("rechaza fuera de rango, decimales y basura", () => {
    expect(notaValida(0)).toBeNull();
    expect(notaValida(11)).toBeNull();
    expect(notaValida(5.5)).toBeNull();
    expect(notaValida("diez")).toBeNull();
    expect(notaValida(null)).toBeNull();
    expect(notaValida(undefined)).toBeNull();
  });
});

describe("comentarioValido", () => {
  it("recorta espacios y limita a 500 caracteres", () => {
    expect(comentarioValido("  muy rico  ")).toBe("muy rico");
    expect(comentarioValido("a".repeat(600))).toBe("a".repeat(500));
  });

  it("null si viene vacío, solo espacios, o no es texto", () => {
    expect(comentarioValido("")).toBeNull();
    expect(comentarioValido("   ")).toBeNull();
    expect(comentarioValido(null)).toBeNull();
    expect(comentarioValido(undefined)).toBeNull();
    expect(comentarioValido(42)).toBeNull();
  });
});
