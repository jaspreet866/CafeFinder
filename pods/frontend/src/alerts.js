import Swal from "sweetalert2"

const baseOptions = {
  confirmButtonColor: "#4f46e5",
  background: "#ffffff",
  color: "#172033"
}

export const showSuccess = (title, text = "") => {
  return Swal.fire({
    ...baseOptions,
    icon: "success",
    title,
    text
  })
}

export const showError = (title, text = "") => {
  return Swal.fire({
    ...baseOptions,
    icon: "error",
    title,
    text
  })
}

export const showWarning = (title, text = "") => {
  return Swal.fire({
    ...baseOptions,
    icon: "warning",
    title,
    text
  })
}

export const showInfo = (title, text = "") => {
  return Swal.fire({
    ...baseOptions,
    icon: "info",
    title,
    text
  })
}
