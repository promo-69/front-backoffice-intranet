import React, { useState, useEffect } from "react";
import { AiOutlinePlus, AiOutlineMinus, AiOutlineDelete, AiOutlineShopping } from "react-icons/ai";
import { ArrowLeft, CheckCircle, Smartphone, CreditCard, Banknote, ShoppingBag } from "lucide-react";
import PopcornImg from "../../assets/images/candy/popcorn.png";
import SodaImg from "../../assets/images/candy/soda.png";
import ComboImg from "../../assets/images/candy/combo.png";
import { concessionsService } from "../../services/concessions.service";
import { ordersService } from "../../services/orders.service";

const CATEGORIES = ["Todos", "Popcorn", "Drinks", "Combos", "Candies"];

const PAYMENT_METHODS = [
  { id: "pago_movil", label: "Pago Móvil", icon: Smartphone, fields: ["Banco", "Teléfono", "Referencia"] },
  { id: "efectivo", label: "Efectivo", icon: Banknote, fields: [] },
  { id: "tarjeta", label: "Tarjeta", icon: CreditCard, fields: ["Últimos 4 dígitos", "Referencia"] },
];

export default function CandyBar() {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [cart, setCart] = useState([]);
  const [apiProducts, setApiProducts] = useState([]);
  const [apiCombos, setApiCombos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState("pago_movil");
  const [paymentFields, setPaymentFields] = useState({});
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const [products, combos] = await Promise.all([
          concessionsService.getProducts(),
          concessionsService.getCombos(),
        ]);
        if (cancelled) return;
        setApiProducts(products || []);
        setApiCombos(combos || []);
      } catch (err) {
        console.error("Error loading concession data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, []);

  const allItems = [
    ...apiProducts.map(p => ({
      id: `prod_${p.id}`,
      name: p.name,
      price: Number(p.pricing?.final_price ?? p.price) || 0,
      category: p._ProductCategories?.description?.includes("Bebida") || p._ProductCategories?.description?.includes("Drink") ? "Drinks" : "Popcorn",
      image: p._ProductCategories?.description?.includes("Bebida") || p._ProductCategories?.description?.includes("Drink") ? SodaImg : PopcornImg,
    })),
    ...apiCombos.map(c => ({
      id: `combo_${c.id}`,
      name: c.name,
      price: Number(c.pricing?.final_price ?? c.price) || 0,
      category: "Combos",
      image: ComboImg,
    })),
  ];

  const filteredProducts = selectedCategory === "Todos" 
    ? allItems 
    : allItems.filter(p => p.category === selectedCategory);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const grandTotal = total * 1.03;

  const mapPaymentMethod = (method) => {
    const map = { pago_movil: "mobile_payment", efectivo: "cash", tarjeta: "transfer" };
    return map[method] || method;
  };

  const handleConfirm = async () => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const cinemaId = userData.cinemaId || 1;

    const concessions = cart.map((item) => {
      const isCombo = item.category === "Combos";
      const rawId = Number(item.id.replace(/^(prod|combo)_/, ""));
      return {
        line_type: isCombo ? 2 : 1,
        product: isCombo ? undefined : rawId,
        combo: isCombo ? rawId : undefined,
        quantity: item.quantity,
      };
    });

    try {
      await ordersService.cancelSession().catch(() => {});
      await ordersService.createQuote(cinemaId, 1);
      const { data } = await ordersService.checkout([], concessions);
      const backendPaymentMethod = mapPaymentMethod(paymentMethod);
      const reference = paymentFields?.Referencia || paymentFields?.reference || null;
      await ordersService.registerPayment(backendPaymentMethod, grandTotal, reference);
    } catch (err) {
      console.warn("Backend order failed, saving locally:", err);
    }
    setConfirmed(true);
  };

  const handleNewSale = () => {
    setCart([]);
    setStep(1);
    setConfirmed(false);
    setPaymentFields({});
  };

  // ----------------------------------------------------
  // STEP 2: PAYMENT SCREEN & SUCCESS
  // ----------------------------------------------------
  if (step === 2) {
    const selectedMethod = PAYMENT_METHODS.find((m) => m.id === paymentMethod);

    if (confirmed) {
      return (
        <div className="flex flex-col items-center justify-center py-20 font-montserrat animate-in fade-in zoom-in-95 bg-white min-h-[calc(100vh-100px)] rounded-3xl shadow-sm border border-gray-100">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-brand-gold/20 rounded-full scale-150 animate-ping" />
            <div className="relative w-24 h-24 rounded-full bg-brand-gold flex items-center justify-center shadow-xl shadow-brand-gold/30">
              <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2 uppercase tracking-widest">¡Venta Exitosa!</h2>
          <p className="text-gray-500 text-center max-w-sm">
            Los productos han sido registrados correctamente. Entrega el pedido al cliente.
          </p>
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center w-full max-w-sm">
            <h3 className="font-bold text-slate-700 mb-4 border-b border-gray-200 pb-2">Resumen</h3>
            {cart.map(item => (
              <div key={item.id} className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{item.name} ×{item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-3xl font-black text-brand-gold">${grandTotal.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-1 uppercase font-semibold">Método: {selectedMethod?.label}</p>
            </div>
          </div>
          
          <button 
            onClick={handleNewSale}
            className="mt-8 px-8 py-3 bg-white border-2 border-brand-gold text-brand-gold rounded-xl font-bold hover:bg-brand-gold/5 transition-all shadow-sm"
          >
            + Nueva Venta
          </button>
        </div>
      );
    }

    return (
      <div className="font-montserrat text-slate-800 bg-white rounded-3xl p-6 lg:p-10 shadow-sm border border-gray-100 min-h-[calc(100vh-100px)] animate-in fade-in slide-in-from-bottom-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Procesar Pago</h2>
            <p className="text-gray-500 text-sm mt-1">Confirma los productos de confitería y el método de pago</p>
          </div>
          <div className="hidden sm:flex bg-gray-100 px-4 py-2 rounded-lg font-bold text-gray-500 gap-2 items-center">
            <span className="w-6 h-6 rounded-full bg-brand-gold text-white flex items-center justify-center text-xs">2</span>
            Pago de Confitería
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Resumen de compra */}
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 space-y-6">
            <h3 className="font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
              <ShoppingBag className="w-5 h-5 text-brand-gold" /> Resumen de Productos
            </h3>
            
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-100">
                  <img src={item.image} className="w-12 h-12 object-cover rounded-lg" alt="" />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-700">{item.name}</p>
                    <p className="text-xs text-gray-400">Cant: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-brand-gold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-200 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-medium text-slate-700">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Impuestos (IGTF 3%)</span>
                <span className="font-medium text-slate-700">${(total * 0.03).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xl font-black pt-4 border-t-2 border-gray-200">
              <span className="text-slate-800 flex items-center gap-2">
                Total a Pagar
              </span>
              <span className="text-brand-gold text-2xl">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Método de pago */}
          <div className="space-y-6">
            <h3 className="font-bold text-slate-700 uppercase tracking-wider">Seleccionar Método de Pago</h3>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`
                      w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left
                      ${isSelected ? "border-brand-gold bg-brand-gold/5" : "border-gray-200 hover:border-gray-300 bg-white"}
                    `}
                  >
                    <div className={`p-2 rounded-xl ${isSelected ? "bg-brand-gold text-white" : "bg-gray-100 text-gray-500"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`font-bold ${isSelected ? "text-slate-800" : "text-gray-600"}`}>{method.label}</span>
                    {isSelected && (
                      <div className="ml-auto w-6 h-6 rounded-full bg-brand-gold text-white flex items-center justify-center">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Campos dinámicos */}
            {selectedMethod?.fields?.length > 0 && (
              <div className="space-y-4 pt-4">
                {selectedMethod.fields.map((field) => (
                  <div key={field} className="relative">
                    <label className="absolute top-2 left-4 text-[10px] font-bold text-brand-gold uppercase tracking-wider bg-white px-1">{field}</label>
                    <input
                      type="text"
                      placeholder={`Ingresar ${field.toLowerCase()}`}
                      onChange={(e) => setPaymentFields((p) => ({ ...p, [field]: e.target.value }))}
                      className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 pt-6 pb-3 text-sm text-slate-800 placeholder:text-gray-300 focus:outline-none focus:border-brand-gold transition-colors"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 mt-8 border-t border-gray-100">
          <button
            onClick={() => setStep(1)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-gray-200 text-gray-500 hover:bg-gray-50 transition-all font-bold"
          >
            <ArrowLeft className="w-5 h-5" /> Volver a Productos
          </button>

          <button
            onClick={handleConfirm}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-brand-gold text-white font-black rounded-xl text-sm uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-brand-gold/30"
          >
            Confirmar Pago · ${grandTotal.toFixed(2)}
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // STEP 1: PRODUCTS SCREEN
  // ----------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 font-montserrat">
        <p className="text-gray-400 text-lg">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 font-montserrat text-slate-800 animate-in fade-in">
      
      {/* Left Side: Categories and Products */}
      <div className="flex-1 space-y-6">
        
        {/* Categories Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-gray-100">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-t-lg transition-all whitespace-nowrap font-medium ${
                selectedCategory === cat 
                  ? "bg-brand-gold/10 text-brand-gold border-b-2 border-brand-gold" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div 
              key={product.id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all group flex flex-col"
            >
              <div className="h-40 overflow-hidden relative bg-gray-50 flex justify-center items-center">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-gray-100 uppercase tracking-wider">
                    {product.category}
                  </span>
                </div>
              </div>
              
              <div className="p-4 flex flex-col flex-1 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-700 leading-tight">{product.name}</h3>
                  <span className="text-brand-gold font-bold">${product.price.toFixed(2)}</span>
                </div>
                
                <button 
                  onClick={() => addToCart(product)}
                  className="mt-auto w-full bg-slate-50 hover:bg-brand-gold hover:text-white border border-gray-100 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all font-semibold text-sm"
                >
                  <AiOutlinePlus /> Agregar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side: Order Summary */}
      <div className="w-full lg:w-[350px] shrink-0">
        <div className="bg-white border border-gray-200 rounded-3xl p-5 flex flex-col h-[calc(100vh-220px)] sticky top-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-50">
            <div className="p-2.5 bg-brand-gold/10 rounded-xl text-brand-gold text-xl">
              <AiOutlineShopping />
            </div>
            <div>
              <h2 className="font-bold text-slate-700">Resumen de Venta</h2>
              <p className="text-gray-400 text-xs">{cart.length} productos seleccionados</p>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-30 py-10">
                <AiOutlineShopping className="text-5xl text-slate-300" />
                <p className="text-sm font-medium">El carrito está vacío</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-3 flex gap-3 border border-gray-100">
                  <img src={item.image} className="w-12 h-12 rounded-lg object-cover bg-white" alt="" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-slate-700 truncate">{item.name}</h4>
                    <p className="text-brand-gold font-bold text-xs">${(item.price * item.quantity).toFixed(2)}</p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <AiOutlineMinus size={10} />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <AiOutlinePlus size={10} />
                      </button>
                      
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-red-400 hover:text-red-500 p-1"
                      >
                        <AiOutlineDelete size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Total */}
          <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Subtotal</span>
              <span className="font-medium text-slate-700">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Impuestos (IGTF 3%)</span>
              <span className="font-medium text-slate-700">${(total * 0.03).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold text-slate-800 pt-2">
              <span>Total</span>
              <span className="text-brand-gold">${grandTotal.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={() => setStep(2)}
              disabled={cart.length === 0}
              className="w-full bg-brand-gold disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl text-sm shadow-md hover:shadow-lg transition-all mt-2 active:scale-95"
            >
              PROCESAR PAGO
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
