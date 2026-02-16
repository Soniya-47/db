async function main() {
    try {
        console.log("Attempting to import @xenova/transformers...");
        const transformers = await import("@xenova/transformers");
        console.log("Import successful!");
        console.log("Pipeline function available:", typeof transformers.pipeline);
    } catch (error) {
        console.error("Import failed:", error);
    }
}

main();
