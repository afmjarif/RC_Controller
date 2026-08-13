/*
  Smart RC Car Controller
  Commands match the Arduino project:
  F B L R S / A M / 1 2 3 / D / H

  IMPORTANT:
  The current HC-05 uses classic Bluetooth SPP.
  Browser Web Bluetooth talks to BLE/GATT devices, so the
  connect() function is prepared for a future BLE module.
*/

const state = {
  connected: false,
  demo: false,
  mode: "MANUAL",
  lastCommand: "S"
};

const $ = (id) => document.getElementById(id);

function log(message) {
  const row = document.createElement("div");
  const time = new Date().toLocaleTimeString();
  row.textContent = `[${time}] ${message}`;
  $("log").prepend(row);
}

function setStatus(type, text) {
  const el = $("status");
  el.className = `status ${type}`;
  el.innerHTML = `<span></span> ${text}`;
}

function updateCommand(command) {
  state.lastCommand = command;
  $("commandValue").textContent = command;

  if (command === "A") state.mode = "AUTO";
  if (command === "M" || command === "S") state.mode = "MANUAL";
  $("modeValue").textContent = state.mode;
}

/*
  Replace this function later with the BLE characteristic write.
  It is deliberately isolated so the controller UI does not need
  to change when the robot's wireless module changes.
*/
async function sendCommand(command) {
  updateCommand(command);

  if (state.demo || !state.connected) {
    log(`${state.demo ? "DEMO" : "LOCAL"} → ${command}`);
    demoResponse(command);
    return;
  }

  // BLE implementation placeholder:
  // await txCharacteristic.writeValue(new TextEncoder().encode(command));
  log(`TX → ${command}`);
}

function demoResponse(command) {
  if (command === "D") {
    const distance = Math.floor(12 + Math.random() * 75);
    $("distanceValue").textContent = `${distance} cm`;
    log(`RX ← Distance: ${distance} cm`);
  }
  if (command === "H") log("Horn activated");
  if (command === "A") log("Auto obstacle avoidance enabled");
  if (command === "M") log("Manual mode enabled");
}

async function connectBluetooth() {
  if (!navigator.bluetooth) {
    log("Web Bluetooth is not available in this browser.");
    log("Use Chrome/Edge with a BLE GATT module, not HC-05.");
    return;
  }

  try {
    log("Opening Bluetooth device picker...");

    // Generic BLE discovery scaffold.
    // Configure service/characteristic UUIDs for the BLE module you use.
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: []
    });

    log(`Selected: ${device.name || "Unknown device"}`);

    // The current HC-05 will normally NOT appear here because it is
    // classic Bluetooth SPP rather than BLE GATT.
    state.connected = true;
    state.demo = false;
    setStatus("online", "Connected");
    $("connectionText").textContent = device.name || "BLE device connected";
    log("BLE device selected. Configure GATT UUIDs in app.js.");
  } catch (error) {
    log(`Bluetooth: ${error.message}`);
  }
}

function enableDemo() {
  state.demo = !state.demo;
  state.connected = false;

  if (state.demo) {
    setStatus("demo", "Demo Mode");
    $("connectionText").textContent = "UI simulation — commands are not sent to the car.";
    $("demoBtn").textContent = "Exit Demo";
    log("Demo mode enabled");
  } else {
    setStatus("offline", "Offline");
    $("connectionText").textContent = "Web Bluetooth ready — BLE hardware required.";
    $("demoBtn").textContent = "Demo Mode";
    log("Demo mode disabled");
  }
}

// Hold-to-drive buttons
document.querySelectorAll(".control").forEach(button => {
  const command = button.dataset.command;

  const start = (event) => {
    event.preventDefault();
    sendCommand(command);
  };

  const stop = (event) => {
    event.preventDefault();
    sendCommand("S");
  };

  button.addEventListener("pointerdown", start);
  button.addEventListener("pointerup", stop);
  button.addEventListener("pointercancel", stop);
  button.addEventListener("pointerleave", stop);
});

document.querySelector(".stop").addEventListener("click", () => sendCommand("S"));

document.querySelectorAll("[data-command]").forEach(button => {
  if (button.classList.contains("control") || button.classList.contains("stop")) return;
  button.addEventListener("click", () => sendCommand(button.dataset.command));
});

$("connectBtn").addEventListener("click", connectBluetooth);
$("demoBtn").addEventListener("click", enableDemo);
$("clearLog").addEventListener("click", () => $("log").innerHTML = "");

window.addEventListener("keydown", (event) => {
  if (event.repeat) return;

  const keys = {
    ArrowUp: "F", w: "F", W: "F",
    ArrowDown: "B", s: "B", S: "B",
    ArrowLeft: "L", a: "L", A: "L",
    ArrowRight: "R", d: "R", D: "R",
    " ": "S",
    h: "H", H: "H"
  };

  const command = keys[event.key];
  if (command) {
    event.preventDefault();
    sendCommand(command);
  }
});

window.addEventListener("keyup", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "W", "a", "A", "s", "S", "d", "D"].includes(event.key)) {
    sendCommand("S");
  }
});

setStatus("offline", "Offline");
log("Controller loaded");
