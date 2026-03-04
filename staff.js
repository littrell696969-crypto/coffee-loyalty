const SUPABASE_URL = "https://awuzfbnwkrtpwtbszmig.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3dXpmYm53a3J0cHd0YnN6bWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDMxNjYsImV4cCI6MjA4NzE3OTE2Nn0.mOGcTwtKp8KC1tXZe9JvozygTfcRJPK2S8oXQcycVm8";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

async function checkAuth() {
  const { data } = await supabaseClient.auth.getUser();

  if (!data.user) {
    window.location.href = "login.html";
  }
}

checkAuth();

let html5QrCode = null;
let isScanning = false;

async function addCoffee(userId) {
  const result = document.getElementById("result");

  const { data, error } = await supabaseClient
    .from("users")
    .select("coffee_count")
    .eq("id", userId)
    .single();

  if (error || !data) {
    result.innerText = "User not found";
    return;
  }

  let newCount = data.coffee_count + 1;

  if (newCount >= 6) {
    await supabaseClient
      .from("users")
      .update({ coffee_count: 0 })
      .eq("id", userId);

    result.innerText = "🎉 FREE COFFEE!";
    return;
  }

  await supabaseClient
    .from("users")
    .update({ coffee_count: newCount })
    .eq("id", userId);

  result.innerText = `Coffee added: ${newCount}/6`;
}

async function onScanSuccess(decodedText) {
  if (isScanning) return;

  isScanning = true;

  try {
    await addCoffee(decodedText);

    if (html5QrCode) {
      await html5QrCode.stop();
      setTimeout(() => {
        startScanner();
      }, 1000);
    }

  } catch (err) {
    console.error(err);
  }

  setTimeout(() => {
    isScanning = false;
  }, 3000);
}

async function startScanner() {
  const result = document.getElementById("result");

  try {
    const devices = await Html5Qrcode.getCameras();

    if (!devices || devices.length === 0) {
      result.innerText = "No camera found";
      return;
    }

    const backCamera = devices.find(device =>
      device.label && device.label.toLowerCase().includes("back")
    );

    const cameraId = backCamera ? backCamera.id : devices[0].id;

    html5QrCode = new Html5Qrcode("reader");
await html5QrCode.start(
  cameraId,
  {
    fps: 10,
    qrbox: { width: 280, height: 280 },
    aspectRatio: 1.0,
    disableFlip: false
  },
  onScanSuccess
);
   
  } catch (err) {
    result.innerText = "Camera error";
    console.error(err);
  }
}

async function manualAdd() {
  let id = document.getElementById("manualId").value.trim();
  if (!id) return;

  if (!id.startsWith("user_")) {
    id = "user_" + id;
  }

  await addCoffee(id);

  document.getElementById("manualId").value = "";
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
}

let currentLang = localStorage.getItem("staffLang") || "en";

const staffTranslations = {
  en: {
    title: "Staff Scanner",
    scan: "Start Scanner",
    logout: "Logout",
    add: "Add Coffee",
    placeholder: "Enter customer ID"
  },
  et: {
    title: "Töötaja Skanner",
    scan: "Käivita Skanner",
    logout: "Logi välja",
    add: "Lisa Kohv",
    placeholder: "Sisesta kliendi ID"
  }
};

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem("staffLang", lang);

  document.getElementById("title").innerText =
    staffTranslations[lang].title;

  document.getElementById("scanBtn").innerText =
    staffTranslations[lang].scan;

  document.getElementById("logoutBtn").innerText =
    staffTranslations[lang].logout;

  document.getElementById("addBtn").innerText =
    staffTranslations[lang].add;

  document.getElementById("manualId").placeholder =
    staffTranslations[lang].placeholder;
}

setLang(currentLang);
