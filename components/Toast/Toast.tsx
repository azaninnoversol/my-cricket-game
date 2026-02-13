import Swal from "sweetalert2";

const baseConfig = {
  confirmButtonColor: "#2563eb",
  cancelButtonColor: "#ef4444",
  background: "#1f2937",
  color: "#fff",
};

const showSuccess = (title: string, text?: string) => {
  return Swal.fire({
    ...baseConfig,
    icon: "success",
    title,
    text,
    timer: 2000,
    showConfirmButton: false,
  });
};

const showError = (title: string, text?: string) => {
  return Swal.fire({
    ...baseConfig,
    icon: "error",
    title,
    text,
    confirmButtonText: "OK",
  });
};

const showWarning = (title: string, text?: string) => {
  return Swal.fire({
    ...baseConfig,
    icon: "warning",
    title,
    text,
    confirmButtonText: "Got it",
  });
};

const showInfo = (title: string, text?: string) => {
  return Swal.fire({
    ...baseConfig,
    icon: "info",
    title,
    text,
    confirmButtonText: "OK",
  });
};

const showConfirm = (title: string, text?: string, confirmText = "Yes", cancelText = "Cancel") => {
  return Swal.fire({
    ...baseConfig,
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });
};

export { showSuccess, showConfirm, showError, showInfo, showWarning };
