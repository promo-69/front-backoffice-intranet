import { describe, it, expect } from "vitest";
import { validatePassword } from "../authValidators";

describe("validatePassword", () => {
  it("debe fallar si la contraseña está vacía", () => {
    expect(validatePassword("")).toBe("La contraseña es obligatoria");
  });
});
