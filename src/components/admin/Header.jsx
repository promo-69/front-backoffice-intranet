export default function Header() {
  return (
    <header className="w-full bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">Panel Administrativo</h1>

      <div className="flex items-center gap-4">
        <span className="text-gray-600">Admin</span>
        <img
          src="https://ui-avatars.com/api/?name=Admin"
          alt="avatar"
          className="w-10 h-10 rounded-full"
        />
      </div>
    </header>
  );
}
