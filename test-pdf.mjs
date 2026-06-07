import { extractText, getDocumentProxy } from 'unpdf';

async function testPdf() {
  console.log("Fetching PDF...");
  const res = await fetch('https://oliver.ni/resume.pdf');
  const buffer = await res.arrayBuffer();
  console.log(`Fetched ${buffer.byteLength} bytes`);

  try {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    console.log(`Parsed PDF document. Pages: ${pdf.numPages}`);
    const { text, totalPages } = await extractText(pdf, { mergePages: true });
    console.log("typeof text:", typeof text);
    console.log("isArray?", Array.isArray(text));
    
    const extractedText = Array.isArray(text) ? text.join('\n') : text;
    console.log("Extracted text preview (first 200 chars):");
    console.log(extractedText.slice(0, 200));
    console.log("Total word count:", extractedText.split(/\s+/).length);

  } catch (err) {
    console.error("Extraction error:", err);
  }
}

testPdf();
