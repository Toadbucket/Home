export function notify(message, duration = 2000) {
  const note = document.getElementById("notification");
  note.textContent = message;
  note.classList.add("visible");
  note.classList.remove("hidden");
  clearTimeout(note._timeout);
  note._timeout = setTimeout(() => {
    note.classList.add("hidden");
    note.classList.remove("visible");
  }, duration);
}