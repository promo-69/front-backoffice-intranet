import { describe, it, expect } from "vitest";
import { validatePassword } from "../authValidators";

describe("validatePassword", () => {
  it("debe fallar si la contraseña está vacía", () => {
    expect(validatePassword("")).toBe("La contraseña es obligatoria");
  });

  it("debe fallar si tiene menos de 8 caracteres", () => {
    expect(validatePassword("Ab1!")).toBe(
      "Debe tener 8-20 caracteres, incluir letra, número y símbolo",
    );
  });

  it("debe fallar si no tiene letra", () => {
    expect(validatePassword("12345678!")).toBe(
      "Debe tener 8-20 caracteres, incluir letra, número y símbolo",
    );
  });

  it("debe fallar si no tiene número", () => {
    expect(validatePassword("Password!")).toBe(
      "Debe tener 8-20 caracteres, incluir letra, número y símbolo",
    );
  });

  it("debe fallar si no tiene símbolo", () => {
    expect(validatePassword("Password1")).toBe(
      "Debe tener 8-20 caracteres, incluir letra, número y símbolo",
    );
  });

  it("debe aceptar una contraseña válida", () => {
    expect(validatePassword("Pass123!")).toBe(true);
  });
});
