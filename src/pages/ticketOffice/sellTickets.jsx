import { useState, useEffect, useRef, useCallback } from "react";
import StepIndicator from "../../components/ticketOffice/StepIndicator";
import StepIdentifyCustomer from "../../components/ticketOffice/StepIdentifyCustomer";
import Step1Showtime from "../../components/ticketOffice/Step1Showtime";
import Step2Seats from "../../components/ticketOffice/Step2Seats";
import { getCinemas } from "../../services/cinema.service";
import Step3Confectionery from "../../components/ticketOffice/Step3Confectionery";
import Step4Payment from "../../components/ticketOffice/Step4Payment";
import { getBillboard, getSeatsStatus, getSeatMap } from "../../services/showtime.service";
import { ArrowLeft } from "lucide-react";
import { concessionsService } from "../../services/concessions.service";
import { ordersService } from "../../services/orders.service";
import socketService from "../../services/socket.service";
import { paymentsService } from "../../services/payments.service";

const SOLD_SEATS_KEY = "cx_sold_seats";
const ORDERS_KEY = "cx_orders";

function getSoldSeatsMap() {
  try {
    return JSON.parse(localStorage.getItem(SOLD_SEATS_KEY) || "{}");
  } catch {
    return {};
  }
}

function getSoldSeats(showtimeId) {
  return getSoldSeatsMap()[showtimeId] || [];
}

function saveSoldSeats(showtimeId, seatIds) {
  const map = getSoldSeatsMap();
  const existing = map[showtimeId] || [];
  map[showtimeId] = [...new Set([...existing, ...seatIds])];
  localStorage.setItem(SOLD_SEATS_KEY, JSON.stringify(map));
}

function saveOrder(order) {
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  const newOrder = { ...order, id: Date.now(), created_at: new Date().toISOString() };
  orders.push(newOrder);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  return newOrder;
}

function mapMovie(m) {
  const genreList = m.genres?.map((g) => g.description).join(", ") || "—";
  const rating = m.age_classification?.description || "";
  return {
    id: m.id,
    title: m.title,
    genre: genreList,
    duration: m.duration_minutes,
    rating,
    poster: m.poster_url,
  };
}

function mapShowtime(s, movieId, backendSoldCount = 0, nonOperationalCount = 0, backendTotalSeats = 0) {
  const dt = new Date(s.booking.start_time);
  const roomLabel = s.booking.room?.name ?? `Sala #${s.booking.room?.id}`;
  const totalSeats = backendTotalSeats || (s.booking.room?.grid_rows || 12) * (s.booking.room?.grid_columns || 12);
  const soldCount = getSoldSeats(s.id).length + backendSoldCount;
  return {
    id: s.id,
    room_booking_id: s.booking.id,
    roomId: s.booking.room?.id,
    movie_id: movieId,
    room: roomLabel,
    gridRows: s.booking.room?.grid_rows || 8,
    gridCols: s.booking.room?.grid_columns || 12,
    date: dt.toISOString().split("T")[0],
    time: dt.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit", hour12: false }),
    price: Number(s.price) || 0,
    available_seats: Math.max(0, totalSeats - soldCount - nonOperationalCount),
    total_seats: totalSeats,
  };
}

function mapSeat(seat) {
  if (seat.seat_condition === 3) return null;
  let status = seat.status;
  if (status === "locked") status = "sold";
  return {
    id: seat.label,
    dbId: seat.id,
    row: seat.row,
    col: seat.column,
    category: seat.category,
    seatCondition: seat.seat_condition,
    status,
  };
}

function mapProduct(p) {
  const catId = p._ProductCategories?.id ?? p.product_category;
  let category;
  if (catId === 1) category = "Bebidas";
  else if (catId === 2) category = "Palomitas";
  else if (catId === 3) category = "Dulces";
  else if (catId === 4) category = "Promociones";
  else category = "Popcorn";
  return {
    id: p.id,
    name: p.name,
    price: Number(p.pricing?.final_price ?? p.price) || 0,
    priceVes: Number(p.pricing?.base_currency_equivalent?.final_price) || null,
    stock: p.stock ?? null,
    category,
    emoji: "🍿",
  };
}

function mapCombo(c) {
  return {
    id: c.id,
    name: c.name,
    price: Number(c.pricing?.final_price ?? c.price) || 0,
    priceVes: Number(c.pricing?.base_currency_equivalent?.final_price) || null,
    description: c.description || "",
    emoji: "🎉",
    items: [],
    _ComboProducts: c._ComboProducts || [],
  };
}

export default function SellTickets() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cinemas, setCinemas] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [movies, setMovies] = useState([]);
  const [allShowtimes, setAllShowtimes] = useState([]);
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const showtimeIdRef = useRef(null);
  const concessionLoadedRef = useRef(false);

  const loadConcessionData = useCallback(async (cinemaId) => {
    setProductsLoading(true);
    try {
      const [allProducts, allCombos] = await Promise.all([
        cinemaId
          ? concessionsService.getAvailableProducts(cinemaId)
          : concessionsService.getProducts(),
        cinemaId
          ? concessionsService.getAvailableCombos(cinemaId)
          : concessionsService.getCombos(),
      ]);
      const mappedProducts = (allProducts || []).map(mapProduct);
      const productStockMap = {};
      for (const p of mappedProducts) productStockMap[p.id] = p.stock ?? 0;
      function comboHasStock(c) {
        const parts = c._ComboProducts || [];
        if (parts.length === 0) return true;
        return parts.every((cp) => (productStockMap[cp.product] || 0) >= cp.quantity);
      }
      const mappedCombos = (allCombos || []).map(mapCombo).map(c => ({ ...c, available: comboHasStock(c) }));
      setProducts(mappedProducts);
      setCombos(mappedCombos);
      concessionLoadedRef.current = true;
    } catch (err) {
      console.error("Error loading concession data:", err);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const [saleData, setSaleData] = useState({
    customer: null,
    cinema: null,
    movie: null,
    showtime: null,
    seatMap: [],
    selectedSeats: [],
    ticketsNeeded: 1,
    totalTickets: 0,
    totalTicketsVes: 0,
    concessionItems: [],
    pricingMatrix: [],
    concessionTotal: 0,
    concessionTotalVes: 0,
  });
  const [sessionExpired, setSessionExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [bankAccountsByMethod, setBankAccountsByMethod] = useState({});
  const [vesCurrencyId, setVesCurrencyId] = useState(2);
  const [exchangeRate, setExchangeRate] = useState(600);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const paymentProcessingRef = useRef(false);
  const pendingPaymentResult = useRef(null);
  useEffect(() => { paymentProcessingRef.current = paymentProcessing }, [paymentProcessing]);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      console.log("Loading cinemas...");
      try {
        const allCinemas = await getCinemas({ limit: -1 });
        const cinemaList = allCinemas?.data || allCinemas?.rows || [];
        if (!Array.isArray(cinemaList) || !cinemaList.length) {
          if (!cancelled) setCinemas(Array.isArray(cinemaList) ? cinemaList : []);
          return;
        }
        const availability = await Promise.all(
          cinemaList.map(async (c) => {
            try {
              const billboard = await getBillboard(c.id);
              const rows = billboard?.rows || [];
              console.log(`[${c.name}] billboard rows:`, rows.length, billboard);
              return { id: c.id, available: rows.length > 0 };
            } catch (err) {
              console.warn(`[${c.name}] billboard error:`, err);
              return { id: c.id, available: false };
            }
          })
        );
        const availMap = Object.fromEntries(availability.map((a) => [a.id, a.available]));
        if (!cancelled) {
          setCinemas(cinemaList.map((c) => ({ ...c, available: availMap[c.id] ?? false })));
        }
      } catch (err) {
        console.error("Error loading cinemas:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();

    socketService.connect();

    return () => {
      cancelled = true;
      if (showtimeIdRef.current) {
        socketService.leaveShowtime(showtimeIdRef.current);
      }
      socketService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (step === 5) {
      loadConcessionData(selectedCinema?.id);
    }
  }, [step, loadConcessionData, selectedCinema]);

  useEffect(() => {
    if (step !== 6) return;
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
  }, [step]);

  useEffect(() => {
    if (timeLeft == null || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setSessionExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    if (step >= 3 && !sessionExpired) {
      (async () => {
        const state = await ordersService.getSessionState().catch(() => null);
        if (state?.expires_in) setTimeLeft(state.expires_in);
      })();
    }
  }, [step]);

  const getShowtimesForMovie = (movieId) =>
    allShowtimes.filter((s) => Number(s.movie_id) === Number(movieId));

  const handleCustomerIdentified = (customerData) => {
    setSaleData((prev) => ({ ...prev, customer: customerData }));
    setStep(2);
  };

  const handleCinemaSelect = async (cinema) => {
    setSelectedCinema(cinema);
    setSaleData((prev) => ({ ...prev, cinema }));
    setLoading(true);
    try {
      const billboard = await getBillboard(cinema.id);
      const rows = billboard?.rows || [];
      const allShowtimes = rows.flatMap((r) => r.showtimes || []);
      const statusResults = await Promise.allSettled(
        allShowtimes.map((st) => getSeatsStatus(st.id))
      );
      const backendSoldMap = {};
      const backendNonOpMap = {};
      const backendTotalMap = {};
      statusResults.forEach((res, i) => {
        if (res.status === "fulfilled" && res.value) {
          const stId = allShowtimes[i].id;
          backendSoldMap[stId] = (res.value.sold?.length || 0) + (res.value.locked?.length || 0);
          backendNonOpMap[stId] = res.value.non_operational_seats || 0;
          backendTotalMap[stId] = res.value.total_seats || 0;
        }
      });
      console.log("backendSoldMap:", JSON.stringify(backendSoldMap));
      setMovies(rows.map((r) => mapMovie(r.movie)));
      setAllShowtimes(
        rows.flatMap((r) =>
          (r.showtimes || []).map((st) => mapShowtime(st, r.movie.id, backendSoldMap[st.id] || 0, backendNonOpMap[st.id] || 0, backendTotalMap[st.id] || 0))
        )
      );
      setStep(3);
    } catch (err) {
      console.error("Error loading billboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieNext = async ({ movie, showtime }) => {
    try {
      const cinemaId = selectedCinema?.id || 1;
      await ordersService.cancelSession().catch(() => {});
      try {
        await ordersService.createQuote(cinemaId, saleData.customer?.customerId || 1);
      } catch (quoteErr) {
        console.error("Error al crear cotización:", quoteErr);
        return;
      }

      const seatMapRes = await getSeatMap(showtime.id);
      const apiSeats = seatMapRes?.seats || [];
      const pricingMatrix = seatMapRes?.pricing?.pricing_matrix || [];

      const soldIds = getSoldSeats(showtime.id);
      const seatMap = apiSeats.map((s) => {
        if (soldIds.includes(s.label)) s.status = "sold";
        return mapSeat(s);
      }).filter(Boolean);

      setSaleData((prev) => ({
        ...prev,
        movie,
        showtime,
        seatMap,
        pricingMatrix,
      }));

      showtimeIdRef.current = showtime.id;

      setSessionExpired(false);
      const state = await ordersService.getSessionState().catch(() => null);
      setTimeLeft(state?.expires_in || 600);
      const usdRate = state?.exchange_rates?.["1"]?.rate;
      if (usdRate) setExchangeRate(Number(usdRate));

      await socketService.waitForConnection();
      socketService.joinShowtime(showtime.id);
      try {
        await socketService.waitForJoin(showtime.id);
      } catch (joinErr) {
        console.warn("join_showtime falló, continuando sin socket:", joinErr.message);
      }

      socketService.off("quote_expired");
      socketService.on("quote_expired", () => {
        setSessionExpired(true);
        setTimeLeft(0);
      });

      // Payment WebSocket events (guarda resultado pendiente si no está procesando)
      const applyPaymentResult = (result) => {
        if (paymentProcessingRef.current) {
          setPaymentProcessing(false);
          setPaymentResult(result);
        } else if (!pendingPaymentResult.current || result.billing || (!pendingPaymentResult.current.billing && result.success && !result.partial)) {
          pendingPaymentResult.current = result;
        }
      };
      socketService.off("payment_success");
      socketService.on("payment_success", (data) => {
        applyPaymentResult({ success: true, partial: true, remainingBalance: data.remaining_balance, message: data.message });
      });
      socketService.off("payment_completed");
      socketService.on("payment_completed", (data) => {
        applyPaymentResult({ success: true, ...data });
      });
      socketService.off("payment_failed");
      socketService.on("payment_failed", (data) => {
        applyPaymentResult({ success: false, ...data });
      });
      socketService.off("billing_required");
      socketService.on("billing_required", (data) => {
        applyPaymentResult({ success: true, billing: true, ...data });
      });

      setStep(4);
    } catch (err) {
      console.error("Error al preparar la sesión de compra:", err);
    }
  };

  const handleSeatsBack = () => {
    if (showtimeIdRef.current) {
      socketService.leaveShowtime(showtimeIdRef.current);
      showtimeIdRef.current = null;
    }
    setStep(3);
  };

  const handleSeatsNext = async ({ selectedSeats, ticketsNeeded, totalPrice }) => {
    setSaleData((prev) => ({
      ...prev,
      selectedSeats,
      ticketsNeeded,
      totalTickets: totalPrice,
      totalTicketsVes: totalPrice * exchangeRate,
    }));
    setStep(5);
  };

  const processOrder = async ({ selectedSeats, showtime, concessionItems, payments }) => {
    const tickets = selectedSeats.map((s) => ({
      seatId: s.dbId,
      booking: showtime.room_booking_id,
      audienceCategoryId: s.audienceCategoryId || 1,
    }));
    const concessions = concessionItems.map((e) => ({
      line_type: e.item.category === "Combo" ? 2 : 1,
      product: e.item.category !== "Combo" ? e.item.id : undefined,
      combo: e.item.category === "Combo" ? e.item.id : undefined,
      quantity: e.qty,
    }));
    const allPayments = payments
      .filter(p => p.method !== 5)
      .map(p => {
        let bank = p.fields?.Banco;
        if (!bank && p.fields?._baId) {
          const baList = bankAccountsByMethod[p.method] || [];
          const ba = baList.find(b => b.id === Number(p.fields._baId));
          if (ba) bank = ba.bankId;
        }
        return {
          payment_method: p.method,
          amount: p.amountVes,
          currency: vesCurrencyId,
          reference_number: p.fields?.Referencia || undefined,
          bank,
          bypass: [2, 3, 4].includes(p.method) ? true : undefined,
          _confirmed: p.confirmed || false,
        };
      });
    const ptsPayment = payments.find(p => p.method === 5);
    if (ptsPayment && ptsPayment.amountVes > 0) {
      allPayments.push({
        payment_method: 5,
        amount: ptsPayment.amountVes,
        currency: vesCurrencyId,
      });
    }
    const unconfirmedPayments = allPayments.filter(p => !p._confirmed)
    console.log("[processOrder] allPayments:", JSON.stringify(allPayments, null, 2));
    if (unconfirmedPayments.length > 0) {
      const paymentResp = await ordersService.registerPayments(unconfirmedPayments);
      if (paymentResp?.data?.message?.includes("Error") || paymentResp?.error) {
        throw new Error(paymentResp?.data?.message || paymentResp?.error || "Error al registrar el pago");
      }
    }
    return {};
  };

  const handleStep3Next = async ({ concessionItems, concessionTotal }) => {
    const concessionTotalVes = concessionItems.reduce((sum, ci) => {
      const ves = ci.item?.priceVes || (ci.item?.price * exchangeRate);
      return sum + ves * ci.qty;
    }, 0);
    setSaleData((prev) => ({
      ...prev,
      concessionItems,
      concessionTotal,
      concessionTotalVes,
    }));

    // Crear la orden antes de mostrar los pagos
    try {
      const tickets = saleData.selectedSeats.map((s) => ({
        seatId: s.dbId,
        booking: saleData.showtime.room_booking_id,
        audienceCategoryId: s.audienceCategoryId || 1,
      }));
      const concessions = concessionItems.map((e) => ({
        line_type: e.item.category === "Combo" ? 2 : 1,
        product: e.item.category !== "Combo" ? e.item.id : undefined,
        combo: e.item.category === "Combo" ? e.item.id : undefined,
        quantity: e.qty,
      }));
      await ordersService.checkout(tickets, concessions);
    } catch (err) {
      console.warn("Checkout before payment failed:", err);
    }
    setStep(6);
  };

  const handleConfirm = async ({ payments }) => {
    const stId = showtimeIdRef.current;
    if (stId && saleData.selectedSeats.length > 0) {
      try {
        await socketService.waitForConnection();
        socketService.joinShowtime(stId);
        await socketService.waitForJoin(stId);
        await Promise.all(
          saleData.selectedSeats.map((s) => socketService.lockSeatWithAck(s.dbId))
        );
      } catch (err) {
        console.warn("Socket lock retry failed, continuing anyway:", err);
      }
    }

    setPaymentProcessing(true);
    setPaymentResult(null);

    try {
      await processOrder({
        selectedSeats: saleData.selectedSeats,
        showtime: saleData.showtime,
        concessionItems: saleData.concessionItems,
        payments,
      });
      // Si todos los pagos ya estaban confirmados, usar resultado pendiente del WebSocket
      const allConfirmed = payments.every(p => p.confirmed)
      if (allConfirmed) {
        if (pendingPaymentResult.current) {
          const r = pendingPaymentResult.current
          // Ignorar saldo pendiente insignificante (< $0.05)
          if (r.partial && r.remainingBalance != null && Number(r.remainingBalance) < 0.10) {
            setPaymentProcessing(false);
            setPaymentResult({ success: true });
          } else {
            setPaymentProcessing(false);
            setPaymentResult(r);
          }
          pendingPaymentResult.current = null;
        }
      }
    } catch (err) {
      console.warn("Backend order failed:", err);
      setPaymentProcessing(false);
      setPaymentResult({ success: false, message: err?.response?.data?.message || "Error al procesar la orden" });
    }
  };

  const handleNewSale = () => {
    if (showtimeIdRef.current) {
      socketService.leaveShowtime(showtimeIdRef.current);
      showtimeIdRef.current = null;
    }
    ordersService.cancelSession().catch(() => {});
    concessionLoadedRef.current = false;
    setSelectedCinema(null);
    concessionLoadedRef.current = false;
    setProducts([]);
    setCombos([]);
    setSaleData({
      customer: null,
      cinema: null,
      movie: null,
      showtime: null,
      seatMap: [],
      pricingMatrix: [],
      selectedSeats: [],
      ticketsNeeded: 1,
      totalTickets: 0,
      concessionItems: [],
      concessionTotal: 0,
    });
    setPaymentProcessing(false);
    setPaymentResult(null);
    pendingPaymentResult.current = null;
    setStep(1);
    setSessionExpired(false);
    setTimeLeft(null);
    localStorage.removeItem(SOLD_SEATS_KEY);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-800 font-montserrat flex items-center justify-center">
        <p className="text-slate-600 text-lg">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 font-montserrat pb-16">
      <div className="max-w-5xl mx-auto px-4 mt-8">
        <StepIndicator currentStep={step} />

        {timeLeft != null && step >= 3 && (
          <div className={`flex items-center justify-end gap-2 mb-2 text-sm font-bold ${timeLeft <= 60 ? "text-red-500" : "text-slate-600"}`}>
            <span className={`w-2 h-2 rounded-full ${timeLeft <= 60 ? "bg-red-500 animate-pulse" : "bg-slate-400"}`} />
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
          </div>
        )}

        {sessionExpired && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
            <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-2xl">⏰</span>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Sesión Expirada</h2>
              <p className="text-slate-600 text-sm mb-6">El tiempo para completar la compra ha terminado. Los asientos han sido liberados.</p>
              <button
                onClick={handleNewSale}
                className="w-full py-3 bg-[#3E2186] text-white font-bold rounded-xl hover:brightness-110 transition-all"
              >
                Nueva Venta
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 md:p-8">
          {step === 1 && (
            <StepIdentifyCustomer onNext={handleCustomerIdentified} />
          )}

          {step === 2 && (
            <div className="p-4">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Seleccionar Sucursal</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cinemas.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => c.available && handleCinemaSelect(c)}
                    disabled={!c.available}
                    className={`bg-white border-2 rounded-2xl p-6 text-left transition-all ${
                      c.available
                        ? "border-gray-200 hover:border-[#3E2186] hover:shadow-lg cursor-pointer"
                        : "border-gray-100 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <h3 className="font-bold text-slate-800 text-lg">{c.name}</h3>
                    <p className="text-slate-600 text-sm mt-1">{c.address}</p>
                    {!c.available && (
                      <span className="inline-block mt-2 text-xs bg-gray-100 text-slate-500 px-2 py-1 rounded">
                        Sin funciones disponibles
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex justify-start pt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 text-slate-700 hover:border-gray-400 hover:text-slate-900 transition-all text-sm"
                >
                  <ArrowLeft className="w-4 h-4" /> Volver
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <Step1Showtime
              movies={movies}
              getShowtimes={getShowtimesForMovie}
              onNext={handleMovieNext}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && saleData.showtime && (
            <Step2Seats
              movie={saleData.movie}
              showtime={saleData.showtime}
              seatMap={saleData.seatMap}
              pricingMatrix={saleData.pricingMatrix}
              onNext={handleSeatsNext}
              onBack={handleSeatsBack}
            />
          )}

          {step === 5 && (
            <Step3Confectionery
              products={products}
              combos={combos}
              loading={productsLoading}
              onNext={handleStep3Next}
              onBack={() => setStep(4)}
            />
          )}

          {step === 6 && (
            <Step4Payment
              movie={saleData.movie}
              showtime={saleData.showtime}
              selectedSeats={saleData.selectedSeats}
              ticketsNeeded={saleData.ticketsNeeded}
              totalTickets={saleData.totalTickets}
              totalTicketsVes={saleData.totalTicketsVes}
              concessionItems={saleData.concessionItems}
              concessionTotal={saleData.concessionTotal}
              concessionTotalVes={saleData.concessionTotalVes}
              onConfirm={handleConfirm}
              onBack={() => setStep(5)}
              paymentMethods={paymentMethods}
              bankAccountsByMethod={bankAccountsByMethod}
              vesCurrencyId={vesCurrencyId}
              exchangeRate={exchangeRate}
              customerInfo={saleData.customer}
              paymentProcessing={paymentProcessing}
              paymentResult={paymentResult}
              onNewSale={handleNewSale}
            />
          )}
        </div>
      </div>
    </div>
  );
}
