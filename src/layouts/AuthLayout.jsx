import imageninit from "../assets/images/fondoinit.png";
import logotipo from "../assets/images/logotype/logoCiineflix.png";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* LADO IZQUIERDO – Branding */}
      <div className="hidden md:block relative min-h-screen">
        <img src={imageninit} alt="Cineflix Logo" className="absolute inset-0 w-full h-full object-cover" />
      </div>

      {/* LADO DERECHO – Formulario */}
      <div className="bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_18%,#231640_53%,#420946_79%,#231640_87%)] min-h-screen flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center space-y-6">
            <img src={logotipo} className="w-60 h-auto" alt="logotipo" />
            <h1 className="text-center text-white text-4xl leading-tight font-montserrat font-bold">
              Gestion interna
            </h1>
        {children}
      </div>
    </div>
  </div>
  );
}
