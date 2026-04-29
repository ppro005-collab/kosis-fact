async function test() {
  const url = "https://kosis-fact.vercel.app/version.txt";
  const start = Date.now();
  console.log("Checking:", url);
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log("Version:", text.trim());
    console.log("Status:", res.status);
  } catch (e) {
    console.log("Error:", e.message);
  }
}
test();
