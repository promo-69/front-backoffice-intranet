/*{export const validateUsername = (value) => {
  if (!value) return "El usuario es requerido";

  const regex = /^(?!.*[-_.]{2})[a-zA-Z0-9][a-zA-Z0-9-_.]{2,18}[a-zA-Z0-9]$/;

  if (!regex.test(value)) {
    return "Usuario inválido (4-20 caracteres, sin símbolos repetidos)";
  }

  return true;
};}*/

export function validateEmail(value) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!value) return "El correo es obligatorio";
  if (!regex.test(value)) return "Ingresa un correo válido";

  return true;
}



// PASSWORD
export function validatePassword(value) {
  if (!value) return "La contraseña es obligatoria";
  return true;
}


