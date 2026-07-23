import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import DisableIfNoPermission from "@/components/ui/DisableIfNoPermission";
import { createCatalogRecord, updateCatalogRecord } from "../../../services/catalog.service";
import { useLoading } from "../../../context/LoadingContext";

const CatalogModal = ({ open, onClose, initialData, selectedCatalog, metadata }) => {
  const { showLoader, hideLoader } = useLoading();
  const [error, setError] = useState("");

  // Extraer campos dinámicos de la metadata, excluyendo los manejados por sistema
  const dynamicFields = metadata 
    ? Object.entries(metadata).filter(([key, config]) => 
        config.editable && !["id", "deleted_at", "created_at", "updated_at", "status"].includes(key)
      )
    : [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Efecto para llenar el formulario si estamos en modo edición
  useEffect(() => {
    if (open) {
      if (initialData) {
        const resetData = {};
        if (dynamicFields.length > 0) {
          dynamicFields.forEach(([key]) => resetData[key] = initialData[key] || "");
        } else {
          resetData.name = initialData.name || "";
          resetData.description = initialData.description || "";
        }
        reset(resetData);
      } else {
        const emptyData = {};
        if (dynamicFields.length > 0) {
          dynamicFields.forEach(([key]) => emptyData[key] = "");
        } else {
          emptyData.name = "";
          emptyData.description = "";
        }
        reset(emptyData);
      }
      setError("");
    }
  }, [open, initialData, reset, metadata]);

  const onSubmit = async (data) => {
    try {
      showLoader();
      setError("");
      
      const payload = dynamicFields.length > 0
        ? dynamicFields.reduce((acc, [key]) => ({ ...acc, [key]: data[key] }), {})
        : {
            name: data.name,
            description: data.description,
          };

      // Si el catálogo requiere 'status', lo enviamos por defecto como 1 (Activo)
      if (metadata && metadata.status) {
        payload.status = initialData?.status ?? 1;
      }

      if (initialData?.id) {
        await updateCatalogRecord(selectedCatalog, initialData.id, payload);
      } else {
        await createCatalogRecord(selectedCatalog, payload);
      }
      onClose(true); // true indica que se guardó exitosamente y debe refrescar la tabla
    } catch (err) {
      console.error("Error al guardar el maestro:", err);
      setError(err.response?.data?.message || "Ocurrió un error al guardar el maestro");
    } finally {
      hideLoader();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose(false)}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white rounded-3xl border-0 shadow-2xl">
        <DialogHeader className="bg-brand-primary p-6 pb-6">
          <DialogTitle className="text-2xl font-montserrat font-bold text-white text-center">
            {initialData ? "Editar Maestro" : "Añadir Nuevo Maestro"}
          </DialogTitle>
          <p className="text-white/80 text-center text-sm mt-2 font-montserrat">
            Completa los detalles del maestro/catálogo
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {dynamicFields.length > 0 ? (
              dynamicFields.map(([key, config]) => (
                <div className="space-y-2" key={key}>
                  <label className="text-sm font-bold text-brand-primary capitalize">
                    {config.uiLabel} {config.isRequired && <span className="text-red-500">*</span>}
                  </label>
                  {config.type === "string" && key.includes("description") ? (
                    <textarea
                      {...register(key, { required: config.isRequired ? `El campo ${config.uiLabel} es obligatorio` : false })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-all outline-none text-sm bg-gray-50/50 min-h-[100px]"
                      placeholder={`Ingrese ${config.uiLabel}`}
                    />
                  ) : (
                    <input
                      type={config.type === "integer" ? "number" : "text"}
                      {...register(key, { required: config.isRequired ? `El campo ${config.uiLabel} es obligatorio` : false })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-all outline-none text-sm bg-gray-50/50"
                      placeholder={`Ingrese ${config.uiLabel}`}
                    />
                  )}
                  {errors[key] && <span className="text-red-500 text-xs">{errors[key].message}</span>}
                </div>
              ))
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-primary">
                    Nombre del Maestro <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("name", { required: "El nombre es obligatorio" })}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-all outline-none text-sm bg-gray-50/50"
                    placeholder="Ej. Categorías de Películas"
                  />
                  {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-primary">
                    Descripción
                  </label>
                  <textarea
                    {...register("description")}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-all outline-none text-sm bg-gray-50/50 min-h-[100px]"
                    placeholder="Breve descripción del propósito de este catálogo..."
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
              className="rounded-xl px-6"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <DisableIfNoPermission permission={initialData ? "CRUD:UPDATE:CATALOGS" : "CRUD:CREATE:CATALOGS"} title="No tienes permiso para guardar catálogos">
              <Button
                type="submit"
                className="bg-brand-gold hover:bg-brand-gold/90 text-white rounded-xl px-8"
                disabled={isSubmitting}
              >
                {initialData ? "Guardar Cambios" : "Crear Maestro"}
              </Button>
            </DisableIfNoPermission>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CatalogModal;
