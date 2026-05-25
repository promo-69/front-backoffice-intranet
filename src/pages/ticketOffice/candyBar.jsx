import React, { useState } from "react";
import { AiOutlinePlus, AiOutlineMinus, AiOutlineDelete, AiOutlineShopping } from "react-icons/ai";
import PopcornImg from "../../assets/images/candy/popcorn.png";
import SodaImg from "../../assets/images/candy/soda.png";
import ComboImg from "../../assets/images/candy/combo.png";

const PRODUCTS = [
  { id: 1, name: "Cotufa Grande", price: 5.5, category: "Popcorn", image: PopcornImg },
  { id: 2, name: "Cotufa Mediana", price: 4.0, category: "Popcorn", image: PopcornImg },
  { id: 3, name: "Pepsi Grande", price: 3.5, category: "Drinks", image: SodaImg },
  { id: 4, name: "Pepsi Mediana", price: 2.5, category: "Drinks", image: SodaImg },
  { id: 5, name: "Combo Duo Cineflix", price: 12.0, category: "Combos", image: ComboImg },
  { id: 6, name: "Combo Familiar", price: 18.5, category: "Combos", image: ComboImg },
];

const CATEGORIES = ["Todos", "Popcorn", "Drinks", "Combos", "Candies"];

export default function CandyBar() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [cart, setCart] = useState([]);

  const filteredProducts = selectedCategory === "Todos" 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === selectedCategory);

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

  return (
    <div className="flex flex-col lg:flex-row gap-8 font-montserrat text-slate-800">
      
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
              <div className="h-40 overflow-hidden relative">
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
              <span className="text-brand-gold">${(total * 1.03).toFixed(2)}</span>
            </div>
            
            <button 
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
