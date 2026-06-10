const url = 'https://lmgcgdnhfzhlrrlobhyn.supabase.co/functions/v1/create-payment';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtZ2NnZG5oZnpobHJybG9iaHluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNjE3NTIsImV4cCI6MjA5NTczNzc1Mn0.COAP3tY_W9WM0htjMl898C4rQ4drBQlZoNeSypizwNk';

async function runTest() {
  const payload = {
    name: 'Eduardo Ivan Franz Both',
    email: 'eduardo@esquadriasmoradadosol.com.br',
    cpf: '037.333.490-75',
    phone: '51994532979',
    city: 'Ivoti',
    uf: 'RS',
    howHeard: 'Indicação de Amigo',
    billingType: 'PIX', // request PIX to trigger the fallback
    value: 350
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`
      },
      body: JSON.stringify(payload)
    });

    console.log('Status Code:', res.status);
    const text = await res.text();
    console.log('Response Body:', text);
  } catch (err) {
    console.error('Fetch Error:', err);
  }
}

runTest();
