// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require("pdf-parse");
// import fs from "fs";

async function testPdf() {
    try {
        // Create a dummy PDF buffer (not a real PDF, but pdf-parse might throw a specific error)
        // Actually, let's try to parse a non-pdf buffer and see if it throws "Failed to parse"
        // or if we can make a minimal PDF.
        // For now, let's just check if the require works and if it throws on invalid data.

        console.log("Testing pdf-parse require...");
        console.log("pdf-parse loaded function:", typeof pdf);

        const dummyBuffer = Buffer.from("Not a PDF");
        try {
            await pdf(dummyBuffer);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            console.log("Expected error on invalid PDF caught:", e.message ? "Yes" : "No");
        }

        console.log("pdf-parse seems loadable.");
    } catch (e) {
        console.error("Critical: pdf-parse failed to load:", e);
    }
}

testPdf();
