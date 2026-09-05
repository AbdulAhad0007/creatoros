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
        input: 'Test',
        provider: {
          type: 'microsoft',
          voice_id: 'en-US-JennyNeural',
        },
      },
      source_url: 'https://upload.wikimedia.org/wikipedia/commons/8/85/Elon_Musk_Royal_Society_%28crop1%29.jpg'
    }),
  });

  const data = await response.json();
  console.log("Generate Res ID:", data);
}

test();
