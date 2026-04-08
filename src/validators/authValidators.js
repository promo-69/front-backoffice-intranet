// USERNAME
export const validateUsername = (value) => {
  if (!value) return "El usuario es requerido";

  const regex = /^(?!.*[-_.]{2})[a-zA-Z0-9][a-zA-Z0-9-_.]{2,18}[a-zA-Z0-9]$/;

  if (!regex.test(value)) {
    return "Usuario inválido (4-20 caracteres, sin símbolos repetidos)";
  }

  return true;
};

// PASSWORD
export const validatePassword = (value) => {
  if (!value) return "Contraseña requerida";

  const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_])[a-zA-Z\d\W_]{8,20}$/;

  if (!regex.test(value)) {
    return "Debe tener 8-20 caracteres, incluir letra, número y símbolo";
  }

  return true;
};
