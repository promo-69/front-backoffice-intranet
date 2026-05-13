import { useState, useEffect } from "react";
import HeaderCashier from "../../components/ticketOffice/HeaderCashier";
import StepIndicator from "../../components/ticketOffice/StepIndicator";
import Step1Showtime from "../../components/ticketOffice/Step1Showtime";
import Step2Seats from "../../components/ticketOffice/Step2Seats";
import Step3Confectionery from "../../components/ticketOffice/Step3Confectionery";
import Step4Payment from "../../components/ticketOffice/Step4Payment";
import {
  initLocalStore,
  getMovies,
  getShowtimesByMovie,
  getSeatMap,
  confirmSeats,
  getConcessionProducts,
  getConcessionCombos,
  saveOrder,
} from "../../services/localStore.service";

export default function SellTickets() {
  const [step, setStep] = useState(1);

  // Datos de catálogos
  const [movies, setMovies] = useState([]);
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);

  // Datos de la venta en progreso
  const [saleData, setSaleData] = useState({
    movie: null,
    showtime: null,
    seatMap: [],
    selectedSeats: [],
    ticketsNeeded: 1,
    totalTickets: 0,
    concessionItems: [],
    concessionTotal: 0,
  });

  // Inicializar localStorage y cargar catálogos
  useEffect(() => {
    initLocalStore();
    setMovies(getMovies());
    setProducts(getConcessionProducts());
    setCombos(getConcessionCombos());
  }, []);

  // ── PASO 1 → PASO 2 ─────────────────────────────────────────
  const handleStep1Next = ({ movie, showtime }) => {
    const seatMap = getSeatMap(showtime.id);
    setSaleData((prev) => ({
      ...prev,
      movie,
      showtime,
      seatMap,
    }));
    setStep(2);
  };

  // ── PASO 2 → PASO 3 ─────────────────────────────────────────
  const handleStep2Next = ({ selectedSeats, ticketsNeeded, totalPrice }) => {
    setSaleData((prev) => ({
      ...prev,
      selectedSeats,
      ticketsNeeded,
      totalTickets: totalPrice,
    }));
    setStep(3);
  };

  // ── PASO 3 → PASO 4 ─────────────────────────────────────────
  const handleStep3Next = ({ concessionItems, concessionTotal }) => {
    setSaleData((prev) => ({
      ...prev,
      concessionItems,
      concessionTotal,
    }));
    setStep(4);
  };

  // ── PASO 4 → CONFIRMAR ───────────────────────────────────────
  const handleConfirm = ({ paymentMethod, paymentFields, grandTotal }) => {
    // Marcar asientos como vendidos en localStorage
    confirmSeats(
      saleData.showtime.id,
      saleData.selectedSeats.map((s) => s.id)
    );

    // Guardar la orden completa
    saveOrder({
      movie: saleData.movie,
      showtime: saleData.showtime,
      seats: saleData.selectedSeats.map((s) => s.id),
      tickets: saleData.ticketsNeeded,
      tickets_total: saleData.totalTickets,
      concession_items: saleData.concessionItems.map((e) => ({
        name: e.item.name,
        qty: e.qty,
        unit_price: e.item.price,
        subtotal: e.item.price * e.qty,
      })),
      concession_total: saleData.concessionTotal,
      payment_method: paymentMethod,
      payment_fields: paymentFields,
      grand_total: grandTotal,
    });
  };

  // Reiniciar flujo para nueva venta
  const handleNewSale = () => {
    setSaleData({
      movie: null,
      showtime: null,
      seatMap: [],
      selectedSeats: [],
      ticketsNeeded: 1,
      totalTickets: 0,
      concessionItems: [],
      concessionTotal: 0,
    });
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_18%,#231640_53%,#420946_79%,#231640_87%)] text-white font-montserrat pb-16">
      <HeaderCashier title="Venta de Boletos" />

      <div className="max-w-5xl mx-auto px-4 mt-8">
        {/* Indicador de pasos */}
        <StepIndicator currentStep={step} />

        {/* Panel de paso activo */}
        <div className="bg-[rgba(29,20,48,0.85)] backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl p-6 md:p-8">
          {step === 1 && (
            <Step1Showtime
              movies={movies}
              getShowtimes={getShowtimesByMovie}
              onNext={handleStep1Next}
            />
          )}

          {step === 2 && saleData.showtime && (
            <Step2Seats
              movie={saleData.movie}
              showtime={saleData.showtime}
              seatMap={saleData.seatMap}
              onNext={handleStep2Next}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <Step3Confectionery
              products={products}
              combos={combos}
              onNext={handleStep3Next}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && (
            <Step4Payment
              movie={saleData.movie}
              showtime={saleData.showtime}
              selectedSeats={saleData.selectedSeats}
              ticketsNeeded={saleData.ticketsNeeded}
              totalTickets={saleData.totalTickets}
              concessionItems={saleData.concessionItems}
              concessionTotal={saleData.concessionTotal}
              onConfirm={handleConfirm}
              onBack={() => setStep(3)}
            />
          )}
        </div>

        {/* Botón nueva venta (solo visible en paso 4 después de confirmar) */}
        {step === 4 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleNewSale}
              className="px-8 py-3 border border-[#F6AD38]/40 text-[#F6AD38] rounded-xl text-sm font-bold hover:bg-[#F6AD38]/10 transition-all"
            >
              + Nueva Venta
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
