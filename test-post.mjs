import fs from 'fs';

async function testPost() {
  const buffer = await fetch('https://oliver.ni/resume.pdf').then(r => r.arrayBuffer());
  const blob = new Blob([buffer], { type: 'application/pdf' });
  
  const formData = new FormData();
  formData.append('file', blob, 'resume.pdf');
  
  const res = await fetch('http://localhost:3000/api/parse-pdf', {
    method: 'POST',
    body: formData
  });
  
  console.log("Status:", res.status);
  const data = await res.json();
  console.log(data);
}

testPost();
