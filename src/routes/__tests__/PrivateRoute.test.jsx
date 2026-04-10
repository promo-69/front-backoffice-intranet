import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PrivateRoute from "../PrivateRoute";

beforeEach(() => {
  localStorage.clear();
});

describe("PrivateRoute", () => {
  it("redirige si no hay usuario", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/ticket/dashboard"]}>
        <PrivateRoute role="cashier">
          <div>Contenido protegido</div>
        </PrivateRoute>
      </MemoryRouter>,
    );

    expect(container.innerHTML).not.toContain("Contenido protegido");
  });

  it("redirige si el rol no coincide", () => {
    localStorage.setItem("user", JSON.stringify({ role: "admin" }));

    const { container } = render(
      <MemoryRouter initialEntries={["/ticket/dashboard"]}>
        <PrivateRoute role="cashier">
          <div>Contenido protegido</div>
        </PrivateRoute>
      </MemoryRouter>,
    );

    expect(container.innerHTML).not.toContain("Contenido protegido");
  });

  it("muestra children si el rol coincide", () => {
    localStorage.setItem("user", JSON.stringify({ role: "cashier" }));

    const { container } = render(
      <MemoryRouter initialEntries={["/ticket/dashboard"]}>
        <PrivateRoute role="cashier">
          <div>Contenido protegido</div>
        </PrivateRoute>
      </MemoryRouter>,
    );

    expect(container.innerHTML).toContain("Contenido protegido");
  });
});
