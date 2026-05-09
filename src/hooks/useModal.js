 import { useState } from "react";

export function useModal() {
  const [modal, setModal] = useState({
    type: null,  //Ejemplo: 'form', 'delete', 'success', etc.
    isOpen: false,
    data: null,    // Objeto a editar, mostrar o eliminar (movies, users, cinemas etc.)
    context: null, // Diferencia entre tabs o módulos (ej: 'movie', 'user', 'cinema' etc.)
  });

  const openModal = (type, data = null, context = null) => 
    setModal({ isOpen: true, type, data, context });

  const closeModal = () => 
    setModal((prev) => ({ ...prev, isOpen: false }));

  return { modal, openModal, closeModal };
}