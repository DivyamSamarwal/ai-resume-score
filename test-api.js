const http = require('http');

async function testApi() {
  try {
    const res = await fetch('http://localhost:3001/api/github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'torvalds' })
    });
    const data = await res.json();
    console.log('GitHub API Status:', res.status);
    console.log('GitHub API Result:', Object.keys(data));
    if (data.error) console.log('Error:', data.error);
  } catch (err) {
    console.error('Error fetching github API', err);
  }
}

testApi();
