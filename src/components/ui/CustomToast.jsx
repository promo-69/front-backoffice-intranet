import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { toast } from "react-hot-toast";

export const CustomToast = ({ t, message, title, type = "success" }) => {
  const configs = {
    success: { icon: <CheckCircle2 className="text-green-500" />, bg: "border-l-green-500" },
    error: { icon: <AlertCircle className="text-red-500" />, bg: "border-l-red-500" },
    warning: { icon: <Info className="text-amber-500" />, bg: "border-l-amber-500" },
  };

  const config = configs[type];

  return (
    <div className={`flex w-full max-w-md bg-white shadow-lg rounded-lg pointer-events-auto border-l-4 ${config.bg} p-4 font-montserrat`}>
      <div className="flex items-start gap-3 w-full">
        <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-900">{title}</p>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">{message}</p>
        </div>
        <button onClick={() => toast.dismiss(t)} className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};