import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useLoading } from '@/context/LoadingContext';
import { getCatalogByName } from '@/services/catalog.service';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputForm } from "@/components/ui/inputForm";
import { SelectForm } from "@/components/ui/SelectForm";

export default function BankAccountModal({ open, onClose, initialData, onSave }) {
  const { showLoader, hideLoader } = useLoading();
  const [formData, setFormData] = useState({
    bank: '',
    currency: '',
    payment_method: '',
    api_key: '',
  });
  
  // Array de detalles: [{ label: '', value: '' }]
  const [details, setDetails] = useState([]);

  const [banks, setBanks] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    if (open) {
      loadCatalogs();
      if (initialData) {
        setFormData({
          bank: initialData.bank || '',
          currency: initialData.currency || '',
          payment_method: initialData.payment_method || '',
          api_key: initialData.api_key || '',
        });
        
        const detailsArray = Array.isArray(initialData.payment_details) 
          ? initialData.payment_details 
          : [];
        setDetails(detailsArray.length > 0 ? detailsArray : [{ label: '', value: '' }]);
      } else {
        setFormData({ bank: '', currency: '', payment_method: '', api_key: '' });
        setDetails([{ label: '', value: '' }]);
      }
    }
  }, [open, initialData]);

  const loadCatalogs = async () => {
    try {
      showLoader();
      const [banksRes, pmRes, curRes] = await Promise.all([
        getCatalogByName('banks'),
        getCatalogByName('payment-methods'),
        getCatalogByName('currencies')
      ]);
      setBanks(banksRes || []);
      setPaymentMethods(pmRes || []);
      setCurrencies(curRes || []);
    } catch (error) {
      console.error('Error loading catalogs for bank accounts:', error);
    } finally {
      hideLoader();
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDetailChange = (index, field, value) => {
    const newDetails = [...details];
    newDetails[index][field] = value;
    setDetails(newDetails);
  };

  const addDetailField = () => {
    setDetails([...details, { label: '', value: '' }]);
  };

  const removeDetailField = (index) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      showLoader();
      
      const payment_details = details
        .filter(d => d.label && d.value)
        .map(d => ({ label: d.label, value: d.value }));

      const payload = {
        ...formData,
        bank: Number(formData.bank),
        currency: Number(formData.currency),
        payment_method: Number(formData.payment_method),
        payment_details
      };

      // Limpiar api_key si está vacío
      if (!payload.api_key) {
        payload.api_key = null;
      }

      if (initialData?.id) {
        payload.id = initialData.id;
      }

      await onSave(payload);
      onClose(true);
    } catch (error) {
      console.error("Error saving bank account:", error);
      const backendMessage = error.response?.data?.message || "Ocurrió un error inesperado";
      toast.error(backendMessage);
    } finally {
      hideLoader();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose(false)}>
      <DialogContent className="max-w-2xl bg-white rounded-cineflix p-0 shadow-2xl border-none flex flex-col max-h-[90vh]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-bold text-brand-primary">
            {initialData ? "Editar Cuenta Bancaria" : "Nueva Cuenta Bancaria"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {initialData
              ? "Modifica los datos de la cuenta bancaria."
              : "Registra una nueva cuenta bancaria en el sistema."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <SelectForm
                  label="Banco"
                  name="bank"
                  value={formData.bank}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione un banco</option>
                  {banks.map(b => (
                    <option key={b.id} value={b.id}>{b.name || b.description}</option>
                  ))}
                </SelectForm>
              </div>

              <div>
                <SelectForm
                  label="Moneda"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione una moneda</option>
                  {currencies
                    .filter(c => !c.description.toLowerCase().includes('cinepuntos'))
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.code} - {c.description}</option>
                  ))}
                </SelectForm>
              </div>

              <div>
                <SelectForm
                  label="Método de Pago"
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione un método</option>
                  {paymentMethods
                    .filter(pm => {
                      const desc = pm.description.toLowerCase();
                      return desc.includes('transferencia') || desc.includes('pago móvil') || desc.includes('pago movil') || desc.includes('punto de venta');
                    })
                    .map(pm => (
                      <option key={pm.id} value={pm.id}>{pm.description}</option>
                  ))}
                </SelectForm>
              </div>

              <div>
                <InputForm
                  label="API Key (Opcional)"
                  name="api_key"
                  value={formData.api_key}
                  onChange={handleChange}
                  placeholder="Ingrese el API Key"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">Detalles de Pago</label>
                <button
                  type="button"
                  onClick={addDetailField}
                  className="text-sm text-brand-primary flex items-center hover:underline"
                >
                  <Plus className="h-4 w-4 mr-1" /> Agregar Campo
                </button>
              </div>
              
              <div className="space-y-3">
                {details.map((detail, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <InputForm
                      label="Etiqueta"
                      placeholder="ej. Número de Teléfono"
                      value={detail.label}
                      onChange={(e) => handleDetailChange(index, 'label', e.target.value)}
                      required
                    />
                    <InputForm
                      label="Valor"
                      placeholder="ej. 04121234567"
                      value={detail.value}
                      onChange={(e) => handleDetailChange(index, 'value', e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeDetailField(index)}
                      className="text-red-500 hover:text-red-700 p-2 sm:self-auto self-end"
                      disabled={details.length === 1}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-brand-primary text-white font-bold hover:bg-brand-primary/90"
            >
              {initialData ? "Guardar Cambios" : "Crear Cuenta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
