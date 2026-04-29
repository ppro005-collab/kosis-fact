const url = "https://kosis-fact.vercel.app/api/analyze";

async function poll() {
  for (let i = 0; i < 20; i++) {
    try {
      const payload = {
        query: "2021~2025년 기준 대학졸업까지 걸린 기간을 교육수준별, 성별로 집계해줘",
        llmMode: "gemini"
      };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      console.log(`Poll ${i + 1}: Logic -> ${data.plan?.targetLogic}, Rows -> ${data.results?.length}`);
      
      if (data.plan?.targetLogic === 'timeToGraduation' && data.results?.length > 0) {
        console.log("SUCCESS!");
        console.log("First 3 rows:", data.results.slice(0, 3));
        return;
      }
    } catch (e) {
      console.log("Error:", e.message);
    }
    await new Promise(r => setTimeout(r, 10000)); // wait 10 seconds
  }
}

poll();
