async function test() {
  const apiKey = 'Z29vZ2xlLW9hdXRoMnwxMDM2MDc1MzI3NTAzNTEzNjEyNzdAYWtfczZvMlI2UGQ5RTBqZWhnRFl6THJf:kpzHiQsHk5QKSkGBzTHjE';
  
  console.log("Generating...");
  const response = await fetch('https://api.d-id.com/talks', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      script: {
        type: 'text',
        input: 'Test script',
        provider: {
          type: 'microsoft',
          voice_id: 'en-US-JennyNeural',
        },
      },
    }),
  });

  const data = await response.json();
  console.log("Generate Res:", data);

  if (data.id) {
    const statusResponse = await fetch(`https://api.d-id.com/talks/${data.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    const statusData = await statusResponse.json();
    console.log("Status Res:", statusData);
  }
}

test();
