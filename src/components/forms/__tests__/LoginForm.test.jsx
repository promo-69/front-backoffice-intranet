import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import LoginForm from "../LoginForm";
import { MemoryRouter } from "react-router-dom";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

beforeEach(() => {
  localStorage.clear();
  mockNavigate.mockReset();
});

describe("LoginForm", () => {
  it("guarda admin en localStorage si el correo es admin@cine.com", async () => {
    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    );

    fireEvent.change(getByPlaceholderText("Correo"), {
      target: { value: "admin@cine.com" },
    });

    fireEvent.change(getByPlaceholderText("Contraseña"), {
      target: { value: "Pass123!" },
    });

    await act(async () => {
      fireEvent.click(getByText("Iniciar sesión"));
    });

    const user = JSON.parse(localStorage.getItem("user"));
    expect(user.role).toBe("admin");
  });

  it("guarda cashier en localStorage si el correo NO es admin", async () => {
    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    );

    fireEvent.change(getByPlaceholderText("Correo"), {
      target: { value: "maria@cine.com" },
    });

    fireEvent.change(getByPlaceholderText("Contraseña"), {
      target: { value: "Pass123!" },
    });

    await act(async () => {
      fireEvent.click(getByText("Iniciar sesión"));
    });

    const user = JSON.parse(localStorage.getItem("user"));
    expect(user.role).toBe("cashier");
  });
});
