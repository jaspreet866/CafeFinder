import Swal from "sweetalert2"

const getBaseOptions = () => {
  const darkMode = document.body.classList.contains("dark-mode")

  return {
    confirmButtonColor: darkMode ? "#818cf8" : "#4f46e5",
    background: darkMode ? "#0f172a" : "#ffffff",
    color: darkMode ? "#f8fafc" : "#172033"
  }
}

export const showSuccess = (title, text = "") => {
  return Swal.fire({
    ...getBaseOptions(),
    icon: "success",
    title,
    text
  })
}

export const showError = (title, text = "") => {
  return Swal.fire({
    ...getBaseOptions(),
    icon: "error",
    title,
    text
  })
}

export const showWarning = (title, text = "") => {
  return Swal.fire({
    ...getBaseOptions(),
    icon: "warning",
    title,
    text
  })
}

export const showInfo = (title, text = "") => {
  return Swal.fire({
    ...getBaseOptions(),
    icon: "info",
    title,
    text
  })
}
