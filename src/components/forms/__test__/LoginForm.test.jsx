import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import LoginForm from "../LoginForm";
import { MemoryRouter } from "react-router-dom";

vi.mock("react-router-dom", () => ({
  ...vi.importActual("react-router-dom"),
  useNavigate: () => vi.fn(),
}));

beforeEach(() => {
  localStorage.clear();
});

describe("LoginForm", () => {
  it("guarda admin en localStorage si el correo es admin@cine.com", () => {
    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    );

    fireEvent.change(getByPlaceholderText("Correo"), {
      target: { value: "admin@cine.com" },
    });

    fireEvent.change(getByPlaceholderText("Contraseña"), {
      target: { value: "123456" },
    });

    fireEvent.click(getByText("Iniciar sesión"));

    const user = JSON.parse(localStorage.getItem("user"));
    expect(user.role).toBe("admin");
  });

  it("guarda cashier en localStorage si el correo NO es admin", () => {
    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    );

    fireEvent.change(getByPlaceholderText("Correo"), {
      target: { value: "maria@cine.com" },
    });

    fireEvent.change(getByPlaceholderText("Contraseña"), {
      target: { value: "123456" },
    });

    fireEvent.click(getByText("Iniciar sesión"));

    const user = JSON.parse(localStorage.getItem("user"));
    expect(user.role).toBe("cashier");
  });
});
