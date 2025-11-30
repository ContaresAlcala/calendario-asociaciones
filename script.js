const backendURL = "https://TU_BACKEND_URL"; // Cambia por la URL de tu backend en Render/Vercel
const associations = {
  contares: { name: "Contares", color: "#1E90FF" },
  pavotroton: { name: "El Pavo Trotón", color: "#32CD32" },
  jacaranda: { name: "Jacaranda", color: "#FF4500" }
};

let username = null;
let userAssociation = null;
let eventos = [];

// Elementos modal
const modal = document.getElementById("modal");
const titleInput = document.getElementById("eventTitle");
const dateInput = document.getElementById("eventDate");
const saveBtn = document.getElementById("saveEvent");
const cancelBtn = document.getElementById("cancelEvent");

// Login simple
document.getElementById("loginBtn").onclick = () => {
  const input = document.getElementById("username").value.trim().toLowerCase();
  if (!associations[input]) return alert("Usuario no autorizado");
  username = input;
  userAssociation = associations[input];
  alert(`Login exitoso como ${userAssociation.name}`);
};

// Inicializar calendario
document.addEventListener("DOMContentLoaded", async () => {
  await cargarEventos();

  const calendarEl = document.getElementById("calendar");
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    headerToolbar: { left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" },
    events: eventos.map(ev => ({
      title: `${ev.title} (${ev.association})`,
      start: ev.start,
      color: associations[ev.association.toLowerCase()]?.color || "gray"
    })),
    dateClick: (info) => {
      if (!username) return alert("Debes hacer login para agregar eventos");
      dateInput.value = info.dateStr;
      modal.style.display = "flex";
    },
    eventClick: async (info) => {
      if (!username) return;
      if (confirm("¿Deseas eliminar este evento?")) {
        eventos = eventos.filter(ev => !(ev.start === info.event.startStr && ev.title === info.event.title));
        info.event.remove();
        await guardarEvento();
      }
    }
  });

  saveBtn.onclick = async () => {
    const title = titleInput.value.trim();
    const date = dateInput.value;
    if (!title || !date) return alert("Completa todos los campos");
    const nuevoEvento = { title, start: date, association: userAssociation.name };
    eventos.push(nuevoEvento);
    await guardarEvento();
    calendar.addEvent({ ...nuevoEvento, color: userAssociation.color });
    modal.style.display = "none";
    titleInput.value = "";
    dateInput.value = "";
  };

  cancelBtn.onclick = () => { modal.style.display = "none"; };

  calendar.render();
});

async function cargarEventos() {
  const res = await fetch(`${backendURL}/eventos`);
  eventos = await res.json();
}

async function guardarEvento() {
  const res = await fetch(`${backendURL}/eventos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, title: eventos[eventos.length-1].title, date: eventos[eventos.length-1].start })
  });
  return res.json();
}
