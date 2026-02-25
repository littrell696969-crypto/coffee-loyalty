const SUPABASE_URL = "https://awuzfbnwkrtpwtbszmig.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3dXpmYm53a3J0cHd0YnN6bWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDMxNjYsImV4cCI6MjA4NzE3OTE2Nn0.mOGcTwtKp8KC1tXZe9JvozygTfcRJPK2S8oXQcycVm8";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

function generateId() {
  return "user_" + Math.random().toString(36).substring(2, 12);
}

async function init() {
  let userId = localStorage.getItem("userId");

  if (!userId) {
    userId = generateId();

    const { error } = await supabaseClient
      .from("users")
      .insert([
        {
          id: userId,
          coffee_count: 0,
          reward_ready: false
        }
      ]);

    if (error) {
      console.error("INSERT ERROR:", error);
      return;
    }

    localStorage.setItem("userId", userId);
  }

  const { data, error } = await supabaseClient
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("SELECT ERROR:", error);
    return;
  }

  const stampsDiv = document.getElementById("stamps");
  const messageDiv = document.getElementById("message");

  stampsDiv.innerHTML = "";

  for (let i = 0; i < 6; i++) {
    if (i < data.coffee_count) {
      stampsDiv.innerHTML += "☕ ";
    } else {
      stampsDiv.innerHTML += "⬜ ";
    }
  }

 if (data.coffee_count === 5) {
  messageDiv.innerText = "☕ Next coffee is FREE!";
} else {
  messageDiv.innerText =
    (6 - data.coffee_count) + " coffees until free one";
}

  document.getElementById("qr").innerHTML = "";
  new QRCode(document.getElementById("qr"), userId);
}


init();
