async function test() {
  const url1 = "https://image.pollinations.ai/prompt/test?width=1920&height=1080&nologo=true&seed=1";
  const url2 = "https://image.pollinations.ai/prompt/test?width=1920&height=1080&nologo=true&seed=2";
  const url3 = "https://image.pollinations.ai/prompt/test?width=1920&height=1080&nologo=true&seed=3";
  
  console.log("Fetching concurrently...");
  const res = await Promise.all([
    fetch(url1), fetch(url2), fetch(url3)
  ]);
  
  for (const r of res) {
    console.log(r.status, r.statusText, r.headers.get("content-type"));
  }
}

test();
