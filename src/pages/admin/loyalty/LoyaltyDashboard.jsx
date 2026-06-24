import React, { useState, useEffect } from "react";
import { Sparkles, Trophy, Coins, Edit2, Check, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getCatalogRecords, updateCatalogRecord } from "../../../services/catalog.service";
import { getExchangeRates, createExchangeRate } from "../../../services/rates.service";
import { useLoading } from "../../../context/LoadingContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InputForm } from "@/components/ui/inputForm";
import { Button } from "@/components/ui/button";

export default function LoyaltyDashboard() {
  const { showLoader, hideLoader } = useLoading();
  const [activeTab, setActiveTab] = useState("levels"); // "levels" or "equivalence"
  
  // States for loyalty levels
  const [levels, setLevels] = useState([]);
  const [editingLevel, setEditingLevel] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [levelForm, setLevelForm] = useState({ name: "", required_points: "" });

  // States for equivalence
  const [currentRate, setCurrentRate] = useState(null);
  const [newRateValue, setNewRateValue] = useState("");
  const [rateHistory, setRateHistory] = useState([]);

  const fetchLoyaltyLevels = async () => {
    try {
      showLoader();
      const res = await getCatalogRecords("loyalty-levels", 1);
      // La API puede devolver { data: [...] } o un array
      const list = res.data || res || [];
      setLevels(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Error al cargar niveles de fidelidad:", error);
      toast.error("No se pudieron cargar los niveles de fidelidad.");
    } finally {
      hideLoader();
    }
  };

  const fetchExchangeRates = async () => {
    try {
      showLoader();
      const res = await getExchangeRates({ page: 1, limit: 100 });
      const list = res.data || res || [];
      const ratesList = Array.isArray(list) ? list : [];
      
      // Filtrar por la moneda 3 (Cinepuntos / PTS)
      const ptsRates = ratesList
        .filter((r) => Number(r.currency) === 3)
        .sort((a, b) => b.id - a.id); // Ordenar por ID descendente para tener el último primero
      
      setRateHistory(ptsRates);
      
      if (ptsRates.length > 0) {
        setCurrentRate(ptsRates[0]);
        setNewRateValue(ptsRates[0].rate.toString());
      } else {
        setCurrentRate(null);
        setNewRateValue("");
      }
    } catch (error) {
      console.error("Error al cargar tasas de cambio:", error);
      toast.error("No se pudo cargar la equivalencia de puntos actual.");
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    if (activeTab === "levels") {
      fetchLoyaltyLevels();
    } else {
      fetchExchangeRates();
    }
  }, [activeTab]);

  // Editar Nivel
  const handleOpenEdit = (level) => {
    setEditingLevel(level);
    setLevelForm({
      name: level.name || "",
      required_points: level.required_points?.toString() || "0",
    });
    setIsEditModalOpen(true);
  };

  const handleSaveLevel = async (e) => {
    e.preventDefault();
    if (!levelForm.name.trim() || !levelForm.required_points) {
      toast.error("Todos los campos son obligatorios.");
      return;
    }
    const ptsNum = Number(levelForm.required_points);
    if (isNaN(ptsNum) || ptsNum < 0 || !Number.isInteger(ptsNum)) {
      toast.error("Los puntos requeridos deben ser un número entero positivo.");
      return;
    }

    try {
      showLoader();
      await updateCatalogRecord("loyalty-levels", editingLevel.id, {
        name: levelForm.name.trim(),
        required_points: ptsNum,
      });
      toast.success("Nivel de fidelidad actualizado con éxito.");
      setIsEditModalOpen(false);
      fetchLoyaltyLevels();
    } catch (error) {
      console.error("Error al actualizar nivel de fidelidad:", error);
      toast.error("Ocurrió un error al guardar los cambios.");
    } finally {
      hideLoader();
    }
  };

  // Guardar Equivalencia (Nueva Tasa de Cambio para PTS)
  const handleSaveEquivalence = async (e) => {
    e.preventDefault();
    const rateNum = Number(newRateValue);
    if (isNaN(rateNum) || rateNum <= 0) {
      toast.error("La tasa de equivalencia debe ser un número positivo.");
      return;
    }

    try {
      showLoader();
      await createExchangeRate({
        currency: 3, // Moneda PTS
        rate: rateNum,
      });
      toast.success("Nueva equivalencia de puntos guardada exitosamente.");
      fetchExchangeRates();
    } catch (error) {
      console.error("Error al registrar nueva tasa de cambio:", error);
      toast.error("No se pudo guardar la equivalencia de puntos.");
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="space-y-6 font-montserrat">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-brand-primary flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-gold animate-pulse" />
            Configuración de Fidelidad
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Administra los niveles de estatus de clientes y el valor de canje de los Cinepuntos.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-100 pb-2">
        <button
          className={`text-xs uppercase tracking-wider pb-2 border-b-2 transition-colors duration-200 font-bold flex items-center gap-2 cursor-pointer ${
            activeTab === "levels"
              ? "text-brand-gold border-brand-gold"
              : "text-slate-400 border-transparent hover:text-brand-primary"
          }`}
          onClick={() => setActiveTab("levels")}
        >
          <Trophy className="w-4 h-4" />
          Niveles de Fidelidad
        </button>
        <button
          className={`text-xs uppercase tracking-wider pb-2 border-b-2 transition-colors duration-200 font-bold flex items-center gap-2 cursor-pointer ${
            activeTab === "equivalence"
              ? "text-brand-gold border-brand-gold"
              : "text-slate-400 border-transparent hover:text-brand-primary"
          }`}
          onClick={() => setActiveTab("equivalence")}
        >
          <Coins className="w-4 h-4" />
          Equivalencia de Cinepuntos
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "levels" ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50 bg-gradient-to-r from-slate-50 to-white">
            <h4 className="text-sm font-bold text-slate-700">Rangos de Estatus</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Los clientes acumulan puntos por compras de boletos y confitería para ascender a estos rangos.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
                  <th className="py-4 px-6 font-bold">Nivel</th>
                  <th className="py-4 px-6 text-center font-bold">Puntos Requeridos</th>
                  <th className="py-4 px-6 text-right font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {levels.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-slate-400">
                      No hay niveles de fidelidad registrados en el catálogo.
                    </td>
                  </tr>
                ) : (
                  levels.map((level) => (
                    <tr key={level.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-brand-gold animate-ping" />
                          <span className="font-bold text-slate-800">{level.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center font-semibold text-slate-600">
                        {level.required_points?.toLocaleString() || 0} pts
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleOpenEdit(level)}
                          className="inline-flex items-center gap-1 text-xs text-brand-primary font-bold hover:text-brand-secondary active:scale-95 transition-all bg-brand-primary/5 hover:bg-brand-primary/10 px-3 py-1.5 rounded-lg border border-brand-primary/10"
                        >
                          <Edit2 className="w-3 h-3" />
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Configuración de Tasa */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-slate-700">Tasa de Canje Oficial</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Define cuántos Bolívares (VES) equivale un Cinepunto (PTS) cuando el cliente lo usa para pagar.
                  </p>
                </div>
                {currentRate && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    Activa
                  </span>
                )}
              </div>

              {/* Tasa actual en grande */}
              <div className="my-8 p-6 bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Equivalencia de Canje
                  </span>
                  <span className="text-3xl font-black text-slate-800 mt-1 block">
                    1 Pts = {currentRate ? Number(currentRate.rate).toFixed(2) : "—"} Bs.
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Ejemplo: Una compra de 100 Bs. costará {currentRate ? (100 / currentRate.rate).toFixed(0) : "—"} Cinepuntos.
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm text-brand-gold shrink-0">
                  <Coins className="w-6 h-6" />
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveEquivalence} className="space-y-4 pt-4 border-t border-slate-50">
              <div className="max-w-xs">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Nueva Equivalencia (Bs. por 1 Pts)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={newRateValue}
                    onChange={(e) => setNewRateValue(e.target.value)}
                    className="w-full bg-[#fcfcfc] border border-slate-200 hover:border-slate-300 focus:border-brand-primary rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-brand-primary transition-all pr-12 font-bold text-slate-700"
                    placeholder="Ej: 0.50"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">
                    Bs.
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-brand-primary hover:bg-brand-secondary text-white rounded-xl px-6 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Actualizar Tasa
                </Button>
              </div>
            </form>
          </div>

          {/* Historial de tasas */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
            <h4 className="text-sm font-bold text-slate-700">Historial de Tasas</h4>
            <p className="text-[10px] text-slate-400 mt-1">
              Registro histórico e inmutable de equivalencias de puntos.
            </p>

            <div className="mt-4 space-y-3 max-h-64 overflow-y-auto pr-1">
              {rateHistory.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No hay historial registrado.</p>
              ) : (
                rateHistory.map((rate, idx) => (
                  <div
                    key={rate.id}
                    className={`flex justify-between items-center p-2.5 rounded-xl border text-xs transition-all ${
                      idx === 0
                        ? "border-brand-primary/20 bg-brand-primary/5"
                        : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-slate-700">1 Pts = {Number(rate.rate).toFixed(2)} Bs.</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Tasa ID: #{rate.id}</p>
                    </div>
                    {idx === 0 && (
                      <span className="text-[8px] font-black text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded uppercase">
                        Actual
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Level Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={(val) => !val && setIsEditModalOpen(false)}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl border-none shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-primary via-brand-gold to-brand-secondary" />

          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-brand-primary flex items-center gap-2">
              <Trophy className="w-5 h-5 text-brand-gold" />
              Editar Nivel de Fidelidad
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveLevel} className="space-y-4 mt-4">
            <InputForm
              label="Nombre del Nivel"
              name="name"
              value={levelForm.name}
              onChange={(e) => setLevelForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Platino"
              className="bg-slate-50/50"
              disabled
            />
            <p className="text-[9px] text-slate-400 -mt-2">El nombre del nivel está restringido por base de datos.</p>

            <InputForm
              label="Puntos Requeridos"
              type="number"
              name="required_points"
              value={levelForm.required_points}
              onChange={(e) => setLevelForm((prev) => ({ ...prev, required_points: e.target.value }))}
              placeholder="Ej: 1000"
              className="bg-slate-50/50"
            />

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-xl px-5 text-xs font-bold"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-brand-primary hover:bg-brand-secondary text-white rounded-xl px-6 text-xs font-bold transition-all shadow-sm"
              >
                Guardar Cambios
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
