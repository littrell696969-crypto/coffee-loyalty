
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
async function addCoffee(userId) {
  const result = document.getElementById("result");

  // Get user
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

  // If reached 6 → reset to 0 and celebrate
  if (newCount >= 6) {
    await supabaseClient
      .from("users")
      .update({ coffee_count: 0 })
      .eq("id", userId);

    result.innerText = "🎉 FREE COFFEE!";
    return;
  }

  // Otherwise just update count
  await supabaseClient
    .from("users")
    .update({ coffee_count: newCount })
    .eq("id", userId);

  result.innerText = `Coffee added: ${newCount}/6`;
}
async function onScanSuccess(decodedText) {
  await addCoffee(decodedText);

  if (html5QrCode) {
    await html5QrCode.stop(); // stop after one scan
  }
}
async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
}
let html5QrCode = null;
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
      { fps: 10, qrbox: 250 },
      onScanSuccess
    );

  } catch (err) {
    result.innerText = "Camera error";
    console.error(err);
  }
}
  
