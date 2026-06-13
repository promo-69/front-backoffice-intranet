import { useState, useEffect, useRef, useCallback } from "react";
import StepIndicator from "../../components/ticketOffice/StepIndicator";
import Step1Showtime from "../../components/ticketOffice/Step1Showtime";
import Step2Seats from "../../components/ticketOffice/Step2Seats";
import { getCinemas } from "../../services/cinema.service";
import Step3Confectionery from "../../components/ticketOffice/Step3Confectionery";
import Step4Payment from "../../components/ticketOffice/Step4Payment";
import { getBillboard } from "../../services/showtime.service";
import { getSeatsByRoom } from "../../services/room.service";
import { concessionsService } from "../../services/concessions.service";
import { ordersService } from "../../services/orders.service";
import socketService from "../../services/socket.service";

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

function mapShowtime(s, movieId) {
  const dt = new Date(s.booking.start_time);
  const roomLabel = s.booking.room?.name ?? `Sala #${s.booking.room?.id}`;
  const totalGrid = 144;
  const soldCount = getSoldSeats(s.id).length;
  return {
    id: s.id,
    room_booking_id: s.booking.id,
    roomId: s.booking.room?.id,
    movie_id: movieId,
    room: roomLabel,
    date: dt.toISOString().split("T")[0],
    time: dt.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit", hour12: false }),
    price: Number(s.price) || 0,
    available_seats: Math.max(0, totalGrid - soldCount),
    total_seats: totalGrid,
  };
}

function mapSeat(seat) {
  const id = `${seat.row_identifier}${seat.column_number}`;
  const isUnavailable = seat.seat_condition === 3 || seat.seat_condition === 2;
  return {
    id,
    dbId: seat.id,
    row: seat.row_identifier,
    col: seat.column_number,
    status: isUnavailable ? "sold" : "available",
  };
}

function mapProduct(p) {
  const catDesc = p._ProductCategories?.description || "";
  return {
    id: p.id,
    name: p.name,
    price: Number(p.pricing?.final_price ?? p.price) || 0,
    category: catDesc.includes("Bebida") ? "Drinks" : catDesc.includes("Chocolate") || catDesc.includes("Dulce") ? "Candies" : "Popcorn",
    emoji: "🍿",
  };
}

function mapCombo(c) {
  return {
    id: c.id,
    name: c.name,
    price: Number(c.pricing?.final_price ?? c.price) || 0,
    description: c.description || "",
    emoji: "🎉",
    items: [],
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
    if (concessionLoadedRef.current) return;
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
      setProducts((allProducts || []).map(mapProduct));
      setCombos((allCombos || []).map(mapCombo));
      concessionLoadedRef.current = true;
    } catch (err) {
      console.error("Error loading concession data:", err);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const [saleData, setSaleData] = useState({
    cinema: null,
    movie: null,
    showtime: null,
    seatMap: [],
    selectedSeats: [],
    ticketsNeeded: 1,
    totalTickets: 0,
    concessionItems: [],
    concessionTotal: 0,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      console.log("Loading cinemas...");
      try {
        const allCinemas = await getCinemas();
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

  // Load concession data when entering step 4 (by then a quote/active session exists)
  useEffect(() => {
    if (step === 4) {
      loadConcessionData(selectedCinema?.id);
    }
  }, [step, loadConcessionData, selectedCinema]);

  const getShowtimesForMovie = (movieId) =>
    allShowtimes.filter((s) => Number(s.movie_id) === Number(movieId));

  const handleCinemaSelect = async (cinema) => {
    setSelectedCinema(cinema);
    setSaleData((prev) => ({ ...prev, cinema }));
    setLoading(true);
    try {
      const billboard = await getBillboard(cinema.id);
      const rows = billboard?.rows || [];
      setMovies(rows.map((r) => mapMovie(r.movie)));
      setAllShowtimes(rows.flatMap((r) => (r.showtimes || []).map((st) => mapShowtime(st, r.movie.id))));
      setStep(2);
    } catch (err) {
      console.error("Error loading billboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieNext = async ({ movie, showtime }) => {
    try {
      const seatMapRes = await getSeatsByRoom(showtime.roomId);
      const apiSeats = seatMapRes?.data?.rows || [];

      const soldIds = getSoldSeats(showtime.id);
      const seatMap = apiSeats.map((s) => {
        const mapped = mapSeat(s);
        if (soldIds.includes(mapped.id)) mapped.status = "sold";
        return mapped;
      });

      setSaleData((prev) => ({
        ...prev,
        movie,
        showtime,
        seatMap,
      }));

      showtimeIdRef.current = showtime.id;
      setStep(3);
    } catch (err) {
      console.error("Error loading seat map:", err);
    }
  };

  const handleSeatsBack = () => {
    if (showtimeIdRef.current) {
      socketService.leaveShowtime(showtimeIdRef.current);
      showtimeIdRef.current = null;
    }
    setStep(2);
  };

  const handleSeatsNext = async ({ selectedSeats, ticketsNeeded, totalPrice }) => {
    setSaleData((prev) => ({
      ...prev,
      selectedSeats,
      ticketsNeeded,
      totalTickets: totalPrice,
    }));
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const cinemaId = userData.cinemaId || 1;
      await ordersService.cancelSession().catch(() => {});
      await ordersService.createQuote(cinemaId, 1);

      const stId = showtimeIdRef.current;
      await socketService.waitForConnection();
      socketService.joinShowtime(stId);
      await socketService.waitForJoin(stId);
      await Promise.all(
        selectedSeats.map((s) => socketService.lockSeatWithAck(s.dbId))
      );
    } catch (err) {
      console.warn("Quote/session setup failed, continuing with localStorage fallback:", err);
    }
    setStep(4);
  };

  const mapPaymentMethod = (method) => {
    const map = { pago_movil: "mobile_payment", efectivo: "cash", tarjeta: "transfer" };
    return map[method] || method;
  };

  const processOrder = async ({ selectedSeats, showtime, concessionItems, paymentMethod, paymentFields, grandTotal }) => {
    const tickets = selectedSeats.map((s) => ({
      seatId: s.dbId,
      booking: showtime.room_booking_id,
      audienceCategoryId: 1,
    }));
    const concessions = concessionItems.map((e) => ({
      line_type: e.item.category === "Combo" ? 2 : 1,
      product: e.item.category !== "Combo" ? e.item.id : undefined,
      combo: e.item.category === "Combo" ? e.item.id : undefined,
      quantity: e.qty,
    }));
    const { data: checkoutData } = await ordersService.checkout(tickets, concessions);
    const backendPaymentMethod = mapPaymentMethod(paymentMethod);
    const reference = paymentFields?.Referencia || paymentFields?.reference || null;
    await ordersService.registerPayment(backendPaymentMethod, grandTotal, reference);
    return checkoutData;
  };

  const handleStep3Next = ({ concessionItems, concessionTotal }) => {
    setSaleData((prev) => ({
      ...prev,
      concessionItems,
      concessionTotal,
    }));
    setStep(5);
  };

  const handleConfirm = async ({ paymentMethod, paymentFields, grandTotal }) => {
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

    try {
      await processOrder({
        selectedSeats: saleData.selectedSeats,
        showtime: saleData.showtime,
        concessionItems: saleData.concessionItems,
        paymentMethod,
        paymentFields,
        grandTotal,
      });
    } catch (err) {
      console.warn("Backend order failed, falling back to localStorage:", err);
    }

    saveSoldSeats(
      saleData.showtime.id,
      saleData.selectedSeats.map((s) => s.id)
    );

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

  const handleNewSale = () => {
    if (showtimeIdRef.current) {
      socketService.leaveShowtime(showtimeIdRef.current);
      showtimeIdRef.current = null;
    }
    ordersService.cancelSession().catch(() => {});
    setSelectedCinema(null);
    concessionLoadedRef.current = false;
    setProducts([]);
    setCombos([]);
    setSaleData({
      cinema: null,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-gray-900 font-montserrat flex items-center justify-center">
        <p className="text-gray-400 text-lg">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-montserrat pb-16">
      <div className="max-w-5xl mx-auto px-4 mt-8">
        <StepIndicator currentStep={step} />

        <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 md:p-8">
          {step === 1 && (
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
                        ? "border-gray-200 hover:border-[#F6AD38] hover:shadow-lg cursor-pointer"
                        : "border-gray-100 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <h3 className="font-bold text-slate-800 text-lg">{c.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">{c.address}</p>
                    {!c.available && (
                      <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-400 px-2 py-1 rounded">
                        Sin funciones disponibles
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <Step1Showtime
              movies={movies}
              getShowtimes={getShowtimesForMovie}
              onNext={handleMovieNext}
            />
          )}

          {step === 3 && saleData.showtime && (
            <Step2Seats
              movie={saleData.movie}
              showtime={saleData.showtime}
              seatMap={saleData.seatMap}
              onNext={handleSeatsNext}
              onBack={handleSeatsBack}
            />
          )}

          {step === 4 && (
            <Step3Confectionery
              products={products}
              combos={combos}
              loading={productsLoading}
              onNext={handleStep3Next}
              onBack={() => setStep(3)}
            />
          )}

          {step === 5 && (
            <Step4Payment
              movie={saleData.movie}
              showtime={saleData.showtime}
              selectedSeats={saleData.selectedSeats}
              ticketsNeeded={saleData.ticketsNeeded}
              totalTickets={saleData.totalTickets}
              concessionItems={saleData.concessionItems}
              concessionTotal={saleData.concessionTotal}
              onConfirm={handleConfirm}
              onBack={() => setStep(4)}
            />
          )}
        </div>

        {step === 5 && (
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
