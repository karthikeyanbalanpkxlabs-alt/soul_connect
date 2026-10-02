const express = require("express");
const path = require("path");
const fs = require("fs");

const {
  handleMediaUpload,
  mediaUploadMiddleware,
} = require("./dist/controllers/mediaUploadController");

async function runTests() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  app.post("/media-upload", mediaUploadMiddleware, handleMediaUpload);

  const server = app.listen(4567, async () => {
    console.log("Test server running on port 4567");

    try {
      // 1. Test image upload
      const imgBuffer = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64"
      );
      const imgBlob = new Blob([imgBuffer], { type: "image/png" });
      const fdImg = new FormData();
      fdImg.append("file", imgBlob, "test_sample.png");

      const resImg = await fetch("http://localhost:4567/media-upload", {
        method: "POST",
        body: fdImg,
      });
      const dataImg = await resImg.json();
      console.log("Image Upload Result:", dataImg);

      // Verify response structure
      if (!dataImg.success || !dataImg.url || !dataImg.path || !dataImg.filename) {
        throw new Error("Image upload response missing required fields");
      }
      if (!dataImg.path.startsWith("/uploads/img_") || !dataImg.path.endsWith(".png")) {
        throw new Error("Unexpected path format: " + dataImg.path);
      }

      // Verify file exists on disk
      const filePathOnDisk = path.join(process.cwd(), "uploads", dataImg.filename);
      if (!fs.existsSync(filePathOnDisk)) {
        throw new Error("Uploaded image does not exist on disk: " + filePathOnDisk);
      }

      // Verify file accessible via static /uploads/
      const staticFetch = await fetch(dataImg.url);
      if (staticFetch.status !== 200) {
        throw new Error("Failed to fetch uploaded image from static URL: " + staticFetch.status);
      }

      // 2. Test PDF upload
      const pdfBuffer = Buffer.from("%PDF-1.4\n%EOF\n");
      const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });
      const fdPdf = new FormData();
      fdPdf.append("file", pdfBlob, "sample_document.pdf");

      const resPdf = await fetch("http://localhost:4567/media-upload", {
        method: "POST",
        body: fdPdf,
      });
      const dataPdf = await resPdf.json();
      console.log("PDF Upload Result:", dataPdf);

      if (!dataPdf.success || !dataPdf.path.startsWith("/uploads/pdf_") || !dataPdf.path.endsWith(".pdf")) {
        throw new Error("PDF upload failed or unexpected format: " + JSON.stringify(dataPdf));
      }

      // 3. Test video / media upload
      const vidBuffer = Buffer.from([0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70]);
      const vidBlob = new Blob([vidBuffer], { type: "video/mp4" });
      const fdVid = new FormData();
      fdVid.append("media", vidBlob, "sample_video.mp4");

      const resVid = await fetch("http://localhost:4567/media-upload", {
        method: "POST",
        body: fdVid,
      });
      const dataVid = await resVid.json();
      console.log("Video Upload Result:", dataVid);

      if (!dataVid.success || !dataVid.path.startsWith("/uploads/vid_") || !dataVid.path.endsWith(".mp4")) {
        throw new Error("Video upload failed or unexpected format: " + JSON.stringify(dataVid));
      }

      // 4. Test error handling on unsupported extension / mime
      const exeBlob = new Blob([Buffer.from("bad data")], { type: "application/x-msdownload" });
      const fdBad = new FormData();
      fdBad.append("file", exeBlob, "malicious.exe");

      const resBad = await fetch("http://localhost:4567/media-upload", {
        method: "POST",
        body: fdBad,
      });
      const dataBad = await resBad.json();
      console.log("Unsupported File Test (expected error):", dataBad);
      if (resBad.status !== 400 || dataBad.success !== false) {
        throw new Error("Expected 400 error for unsupported file type");
      }

      // Clean up test files
      if (fs.existsSync(filePathOnDisk)) fs.unlinkSync(filePathOnDisk);
      const pdfDisk = path.join(process.cwd(), "uploads", dataPdf.filename);
      if (fs.existsSync(pdfDisk)) fs.unlinkSync(pdfDisk);
      const vidDisk = path.join(process.cwd(), "uploads", dataVid.filename);
      if (fs.existsSync(vidDisk)) fs.unlinkSync(vidDisk);

      console.log("\nALL TESTS PASSED SUCCESSFULLY! ✅");
    } catch (err) {
      console.error("Test failed with error:", err);
      process.exitCode = 1;
    } finally {
      server.close();
    }
  });
}

runTests();
