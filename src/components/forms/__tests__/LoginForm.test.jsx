import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, act, screen } from "@testing-library/react";
import LoginForm from "../LoginForm";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../../../../context/AuthContext"; // Ajusta la ruta según tu proyecto
import React from "react";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("LoginForm", () => {
  // Creamos un mock de la función login que requiere el componente
  const mockLogin = vi.fn().mockResolvedValue({ status: 200 });

  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockReset();
    mockLogin.mockClear();
  });

  // Helper para renderizar con el contexto necesario
  const renderWithProviders = (ui) => {
    return render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <MemoryRouter>{ui}</MemoryRouter>
      </AuthContext.Provider>,
    );
  };

  it("guarda admin en localStorage si el correo es admin@cine.com", async () => {
    renderWithProviders(<LoginForm />);

    fireEvent.change(screen.getByPlaceholderText(/Correo/i), {
      target: { value: "admin@cine.com" },
    });

    fireEvent.change(screen.getByPlaceholderText(/Contraseña/i), {
      target: { value: "Pass123!" },
    });

    // Usamos await act para asegurar que las promesas y estados se procesen
    await act(async () => {
      fireEvent.click(screen.getByText(/Iniciar sesión/i));
    });

    const user = JSON.parse(localStorage.getItem("user"));
    expect(user.role).toBe("admin");
    expect(mockLogin).toHaveBeenCalled();
  });

  it("guarda cashier en localStorage si el correo NO es admin", async () => {
    renderWithProviders(<LoginForm />);

    fireEvent.change(screen.getByPlaceholderText(/Correo/i), {
      target: { value: "maria@cine.com" },
    });

    fireEvent.change(screen.getByPlaceholderText(/Contraseña/i), {
      target: { value: "Pass123!" },
    });

    await act(async () => {
      fireEvent.click(screen.getByText(/Iniciar sesión/i));
    });

    const user = JSON.parse(localStorage.getItem("user"));
    expect(user.role).toBe("cashier");
    expect(mockLogin).toHaveBeenCalled();
  });
});
