const url = "https://kosis-fact.vercel.app/api/analyze";

async function testFreshQuery() {
  const payload = {
    query: "2021~2024년 기준 대학졸업까지 걸린 기간을 교육수준별, 성별로 집계해줘! (캐시우회용)",
    llmMode: "gemini"
  };

  const start = Date.now();
  console.log("Sending query to:", url);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
      body: JSON.stringify(payload)
    });
    
    console.log("Status:", res.status, res.statusText);
    const duration = (Date.now() - start) / 1000;
    console.log(`Took ${duration} seconds`);
    
    if (!res.ok) {
      const text = await res.text();
      console.log("Error body:", text.substring(0, 500));
      return;
    }
    
    const data = await res.json();
    console.log("Plan Target Logic:", data.plan?.targetLogic);
    console.log("Rows count:", data.results?.length);
    console.log("First 3 rows:", data.results?.slice(0, 3));
  } catch (err) {
    console.error("Fetch error:", err.message);
  }
}

testFreshQuery();
