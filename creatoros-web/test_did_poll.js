async function test() {
  const apiKey = 'Z29vZ2xlLW9hdXRoMnwxMDM2MDc1MzI3NTAzNTEzNjEyNzdAYWtfczZvMlI2UGQ5RTBqZWhnRFl6THJf:kpzHiQsHk5QKSkGBzTHjE';
  
  const statusResponse = await fetch(`https://api.d-id.com/talks/tlk_Cmdbqs-cuhcUZETte5427`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${apiKey}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  });
  const statusData = await statusResponse.json();
  console.log("Status Data:", statusData);
}

test();
