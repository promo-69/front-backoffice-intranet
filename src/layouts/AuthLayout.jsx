import imageninit from "../assets/images/fondoinit.png";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* LADO IZQUIERDO – Branding */}
      <div className="hidden md:flex flex-col items-center justify-center bg-[#2A0E4D] text-white p-10">
        <img src={imageninit} alt="Cineflix Logo" className="w-48 mb-6" />
      </div>

      {/* LADO DERECHO – Formulario */}
      <div className="flex items-center justify-center bg-gray-100 p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-4xl font-bold tracking-wide">CINEFLIX</h1>
          <p className="text-lg mt-2 opacity-80">Gestión interna</p>
          {children}
        </div>
      </div>
    </div>
  );
}
