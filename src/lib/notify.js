import { toast } from "sonner";
import { CustomToast } from "@/components/ui/CustomToast";

export const notify = {
  success: (title, message) => {
    toast.custom((t) => <CustomToast t={t} title={title} message={message} type="success" />);
  },

  error: (error) => {
    // Extraemos el mensaje del backend 
    const backendMessage = error.response?.data?.message;
    const fallback = "Ocurrió un error inesperado";
    
    toast.custom((t) => (
      <CustomToast 
        t={t} 
        title="Hubo un problema" 
        message={backendMessage || fallback} 
        type="error" 
      />
    ));
  },
  
  warning: (title, message) => {
    toast.custom((t) => <CustomToast t={t} title={title} message={message} type="warning" />);
  }
};