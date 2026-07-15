import React, { useState, useEffect } from "react";
import { AiOutlinePlus, AiOutlineMinus, AiOutlineDelete, AiOutlineShopping } from "react-icons/ai";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import PopcornImg from "../../assets/images/candy/popcorn.png";
import SodaImg from "../../assets/images/candy/soda.png";
import ComboImg from "../../assets/images/candy/combo.png";
import { concessionsService } from "../../services/concessions.service";
import { ordersService } from "../../services/orders.service";
import { paymentsService } from "../../services/payments.service";
import StepIdentifyCustomer from "../../components/ticketOffice/StepIdentifyCustomer";
import Step4Payment from "../../components/ticketOffice/Step4Payment";
import socketService from "../../services/socket.service";

const CATEGORIES = ["Todos", "Popcorn", "Drinks", "Combos", "Candies", "Promociones"];

export default function CandyBar() {
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [cart, setCart] = useState([]);
  const [apiProducts, setApiProducts] = useState([]);
  const [apiCombos, setApiCombos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment states
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [bankAccountsByMethod, setBankAccountsByMethod] = useState({});
  const [vesCurrencyId, setVesCurrencyId] = useState(2);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  const handleCustomerIdentified = async (customerData) => {
    setCustomer(customerData);
    try {
      await ordersService.cancelSession().catch(() => {});
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const cinemaId = userData.cinemaId || 1;
      await ordersService.createQuote(cinemaId, customerData.customerId);
      const state = await ordersService.getSessionState().catch(() => null);
      const usdRate = state?.exchange_rates?.["1"]?.rate;
      if (usdRate) setExchangeRate(Number(usdRate));
    } catch (err) {
      console.warn("Error creating quote:", err);
    }
    const userData2 = JSON.parse(localStorage.getItem("user") || "{}");
    const cId = userData2.cinemaId || 1;
    const [products, combos] = await Promise.all([
      concessionsService.getAvailableProducts(cId),
      concessionsService.getAvailableCombos(cId),
    ]);
    setApiProducts(products || []);
    setApiCombos(combos || []);

    // Conectar socket para escuchar eventos de pago
    socketService.connect();
    socketService.off("payment_success");
    socketService.on("payment_success", (data) => {
      setPaymentProcessing(false);
      setPaymentResult({ success: true, partial: true, remainingBalance: data.remaining_balance, message: data.message });
    });
    socketService.off("payment_completed");
    socketService.on("payment_completed", (data) => {
      setPaymentProcessing(false);
      setPaymentResult({ success: true, ...data });
    });
    socketService.off("payment_failed");
    socketService.on("payment_failed", (data) => {
      setPaymentProcessing(false);
      setPaymentResult({ success: false, ...data });
    });
    socketService.off("billing_required");
    socketService.on("billing_required", (data) => {
      setPaymentProcessing(false);
      setPaymentResult({ success: true, billing: true, ...data });
    });

    setLoading(false);
    setStep(2);
  };

  const handleGoToPayment = () => {
    setStep(3);
  };

  const [exchangeRate, setExchangeRate] = useState(600);
  const [concessionTotalVes, setConcessionTotalVes] = useState(0);

  useEffect(() => {
    async function loadPaymentData() {
      try {
        const [methods, currencyList, options] = await Promise.all([
          paymentsService.getMethods(),
          paymentsService.getCurrencies(),
          paymentsService.getPaymentOptions().catch(() => []),
        ]);
        setPaymentMethods(methods);
        const ves = currencyList.find(c => c.code === "VES");
        if (ves) setVesCurrencyId(ves.id);
        const bankMap = {};
        for (const opt of options) {
          if (opt._BankAccounts?.length) {
            bankMap[opt.id] = opt._BankAccounts.map(ba => ({
              id: ba.id,
              bankId: ba.bank,
              bankName: ba._Banks?.name || "",
              currency: ba.currency,
              paymentDetails: (() => {
                if (Array.isArray(ba.payment_details)) return ba.payment_details;
                try { return JSON.parse(ba.payment_details); } catch { return []; }
              })(),
            }));
          }
        }
        setBankAccountsByMethod(bankMap);
      } catch (err) {
        console.error("Error loading payment data:", err);
      }
    }
    loadPaymentData();
  }, []);

  const productStockMap = {};
  for (const p of apiProducts) {
    productStockMap[p.id] = p.stock ?? 0;
  }

  function comboHasStock(c) {
    const parts = c._ComboProducts || [];
    if (parts.length === 0) return true;
    return parts.every((cp) => (productStockMap[cp.product] || 0) >= cp.quantity);
  }

  const allItems = [
    ...apiProducts.map(p => {
      const catId = p._ProductCategories?.id ?? p.product_category;
      let category;
      if (catId === 1) category = "Drinks";
      else if (catId === 2) category = "Popcorn";
      else if (catId === 3) category = "Candies";
      else if (catId === 4) category = "Promociones";
      else category = "Popcorn";
      return {
        id: `prod_${p.id}`,
        name: p.name,
        price: Number(p.pricing?.final_price ?? p.price) || 0,
        priceVes: Number(p.pricing?.base_currency_equivalent?.final_price) || null,
        stock: p.stock ?? null,
        category,
        image: catId === 1 ? SodaImg : PopcornImg,
      };
    }),
    ...apiCombos.map(c => ({
      id: `combo_${c.id}`,
      name: c.name,
      price: Number(c.pricing?.final_price ?? c.price) || 0,
      priceVes: Number(c.pricing?.base_currency_equivalent?.final_price) || null,
      stock: null,
      available: comboHasStock(c),
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

  const handleConfirm = async ({ payments }) => {
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

    setPaymentProcessing(true);
    setPaymentResult(null);

    try {
      await ordersService.cancelSession().catch(() => {});
      await ordersService.createQuote(cinemaId, customer?.customerId);
      await ordersService.checkout([], concessions);
      const allPayments = payments
        .filter(p => p.method !== 5)
        .map(p => ({
          payment_method: p.method,
          amount: p.amountVes,
          currency: vesCurrencyId,
          reference_number: p.fields?.Referencia || undefined,
          bank: p.fields?.Banco || undefined,
        }));
      const ptsPayment = payments.find(p => p.method === 5);
      if (ptsPayment && ptsPayment.amountVes > 0) {
        allPayments.push({
          payment_method: 5,
          amount: ptsPayment.amountVes,
          currency: vesCurrencyId,
        });
      }
      if (allPayments.length > 0) {
        await ordersService.registerPayments(allPayments);
      }
      // El resultado llega por WebSocket (payment_completed / payment_failed / payment_success)
    } catch (err) {
      console.warn("Backend order failed:", err);
      setPaymentProcessing(false);
      setPaymentResult({ success: false, message: err?.response?.data?.message || "Error al procesar la orden" });
    }
  };

  const handleNewSale = () => {
    setCustomer(null);
    setCart([]);
    setPaymentProcessing(false);
    setPaymentResult(null);
    setStep(1);
  };

  // ----------------------------------------------------
  // STEP 1: CLIENTE
  // ----------------------------------------------------
  if (step === 1) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 md:p-8 max-w-2xl mx-auto">
        <StepIdentifyCustomer onNext={handleCustomerIdentified} />
      </div>
    );
  }

  // ----------------------------------------------------
  // STEP 3: PAYMENT
  // ----------------------------------------------------
  if (step === 3) {
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const cartTotalVes = cart.reduce((sum, item) => {
      const ves = item.priceVes || (item.price * exchangeRate);
      return sum + ves * item.quantity;
    }, 0);
    return (
      <Step4Payment
        key={`payment-${cartTotal}`}
        concessionItems={cart}
         concessionTotal={cartTotal}
         concessionTotalVes={cartTotalVes}
         onConfirm={handleConfirm}
         onBack={handleNewSale}
         onNewSale={handleNewSale}
         paymentMethods={paymentMethods}
         bankAccountsByMethod={bankAccountsByMethod}
         vesCurrencyId={vesCurrencyId}
         exchangeRate={exchangeRate}
         customerInfo={customer}
         paymentProcessing={paymentProcessing}
         paymentResult={paymentResult}
       />
    );
  }

  // ----------------------------------------------------
  // STEP 2: PRODUCTS SCREEN
  // ----------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 font-montserrat">
        <p className="text-slate-700 text-lg">Cargando productos...</p>
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
                  ? "bg-brand-primary/10 text-brand-primary border-b-2 border-brand-primary" 
                  : "text-slate-700 hover:text-slate-900 hover:bg-gray-50"
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
                  <div className="text-right">
                    <span className="text-brand-primary font-bold block">${product.price.toFixed(2)}</span>
                    {product.priceVes != null && (
                      <span className="text-slate-600 text-[11px]">Bs. {product.priceVes.toFixed(2)}</span>
                    )}
                  </div>
                </div>
                {product.stock != null && product.stock <= 0 && (
                  <p className="text-red-400 text-[10px] font-semibold">Sin stock</p>
                )}
                {product.available === false && (
                  <p className="text-red-400 text-[10px] font-semibold">No disponible</p>
                )}
                {product.stock != null && product.stock > 0 && product.stock <= 5 && (
                  <p className="text-amber-500 text-[10px] font-semibold">Stock: {product.stock}</p>
                )}
                
                <button 
                  onClick={() => addToCart(product)}
                  disabled={(product.stock != null && product.stock <= 0) || product.available === false}
                  className="mt-auto w-full bg-slate-50 hover:bg-brand-primary hover:text-white border border-gray-100 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
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
            <div className="p-2.5 bg-brand-primary/10 rounded-xl text-brand-primary text-xl">
              <AiOutlineShopping />
            </div>
            <div>
              <h2 className="font-bold text-slate-700">Resumen de Venta</h2>
              <p className="text-slate-600 text-xs">{cart.length} productos seleccionados</p>
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
                    <p className="text-brand-primary font-bold text-xs">${(item.price * item.quantity).toFixed(2)}</p>
                    
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
            <div className="flex justify-between items-center text-xl font-bold text-slate-800 pt-2">
              <span>Total</span>
              <span className="text-brand-primary">${total.toFixed(2)}</span>
            </div>
            
            <button
              onClick={() => setStep(1)}
              className="w-full bg-white border border-gray-200 text-slate-700 font-bold py-3 rounded-xl text-sm hover:bg-gray-50 transition-all"
            >
              ← Cambiar Cliente
            </button>

            <button 
              onClick={handleGoToPayment}
              disabled={cart.length === 0}
              className="w-full bg-brand-primary disabled:bg-gray-200 disabled:text-slate-500 text-white font-bold py-3.5 rounded-xl text-sm shadow-md hover:shadow-lg transition-all mt-2 active:scale-95"
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
