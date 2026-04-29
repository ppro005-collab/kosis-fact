async function checkDiag() {
  const url = "https://kosis-fact.vercel.app/api/diag";
  console.log("Checking diag:", url);
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error:", e.message);
  }
}

checkDiag();
