import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

// Target uploads directory
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed MIME patterns: images, PDFs, videos, audios, and documents
const ALLOWED_MIME_PATTERNS = [
  /^image\//,
  /^video\//,
  /^audio\//,
  /^application\/pdf$/,
  /^application\/msword$/,
  /^application\/vnd\.openxmlformats-officedocument\./,
  /^text\/plain$/,
];

// Configure Multer Disk Storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Check if custom prefix is specified in query, body, header, or fieldname
    const rawPrefix =
      (req.query?.prefix as string) ||
      (req.body?.prefix as string) ||
      (req.headers["x-prefix"] as string) ||
      (file.fieldname &&
      file.fieldname !== "file" &&
      file.fieldname !== "files" &&
      file.fieldname !== "media"
        ? file.fieldname
        : "");

    let cleanPrefix = "";
    if (rawPrefix) {
      cleanPrefix = String(rawPrefix)
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .toLowerCase();
    }

    // Default prefix if none provided
    let prefix = cleanPrefix;
    if (!prefix) {
      if (file.mimetype.startsWith("image/")) {
        prefix = "profile";
      } else if (file.mimetype === "application/pdf") {
        prefix = "pdf";
      } else if (file.mimetype.startsWith("video/")) {
        prefix = "vid";
      } else if (file.mimetype.startsWith("audio/")) {
        prefix = "aud";
      } else {
        prefix = "media";
      }
    }

    // Determine file extension
    const parsedExt = path
      .extname(file.originalname || "")
      .toLowerCase()
      .replace(".", "");

    let ext = parsedExt;
    if (!ext) {
      if (file.mimetype === "application/pdf") {
        ext = "pdf";
      } else if (file.mimetype.startsWith("image/")) {
        const sub = file.mimetype.split("/")[1] || "png";
        ext = sub === "jpeg" ? "jpg" : sub;
      } else if (file.mimetype.startsWith("video/")) {
        ext = file.mimetype.split("/")[1] || "mp4";
      } else if (file.mimetype.startsWith("audio/")) {
        ext = file.mimetype.split("/")[1] || "mp3";
      } else {
        ext = "bin";
      }
    }
    if (ext === "jpeg") ext = "jpg";

    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 10000);
    const filename = `${prefix}_${timestamp}_${randomSuffix}.${ext}`;
    cb(null, filename);
  },
});

// Configure Multer instance
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for media files
  },
  fileFilter: (_req, file, cb) => {
    const isAllowed = ALLOWED_MIME_PATTERNS.some((pattern) =>
      pattern.test(file.mimetype),
    );
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Unsupported file type '${file.mimetype}'. Allowed types: images, PDF, video, audio.`,
        ),
      );
    }
  },
});

/**
 * Express middleware for multipart/form-data upload.
 * Accepts any field name (e.g. 'file', 'media', 'image', 'pdf', 'upload', etc.)
 */
export const mediaUploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  upload.any()(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            error: "File size limit exceeded. Maximum allowed size is 100MB.",
          });
        }
        return res.status(400).json({
          success: false,
          error: `Multer upload error: ${err.message}`,
        });
      }
      return res.status(400).json({
        success: false,
        error: err.message || "Failed to parse uploaded file.",
      });
    }
    next();
  });
};

/**
 * Helper to build public URL and relative path for a saved file
 */
function buildFileResponse(req: Request, filename: string, originalName?: string, mimetype?: string, size?: number) {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol =
    (typeof forwardedProto === "string"
      ? forwardedProto.split(",")[0].trim()
      : null) ||
    req.protocol ||
    "http";

  const host = req.get("host") || `localhost:${process.env.PORT || 3000}`;
  const relativePath = `/uploads/${filename}`;
  const fullUrl = `${protocol}://${host}${relativePath}`;

  return {
    url: fullUrl,
    path: relativePath,
    filename,
    originalName: originalName || filename,
    mimetype: mimetype || "application/octet-stream",
    size: size || 0,
  };
}

/**
 * Helper to handle base64 strings if sent via JSON or FormData text field
 */
function processBase64Content(req: Request, base64Str: string): ReturnType<typeof buildFileResponse> | null {
  if (!base64Str || typeof base64Str !== "string") return null;

  // If already an existing URL or path
  if (
    base64Str.startsWith("http://") ||
    base64Str.startsWith("https://") ||
    base64Str.startsWith("/uploads/")
  ) {
    const filename = path.basename(base64Str);
    const forwardedProto = req.headers["x-forwarded-proto"];
    const protocol =
      (typeof forwardedProto === "string"
        ? forwardedProto.split(",")[0].trim()
        : null) ||
      req.protocol ||
      "http";
    const host = req.get("host") || `localhost:${process.env.PORT || 3000}`;
    const fullUrl = base64Str.startsWith("http")
      ? base64Str
      : `${protocol}://${host}${base64Str}`;
    const relativePath = base64Str.startsWith("http")
      ? `/uploads/${filename}`
      : base64Str;

    return {
      url: fullUrl,
      path: relativePath,
      filename,
      originalName: filename,
      mimetype: "application/octet-stream",
      size: 0,
    };
  }

  if (!base64Str.startsWith("data:")) return null;

  try {
    let ext = "png";
    let prefix = "media";
    let mimetype = "image/png";
    let data = base64Str;

    const commaIdx = base64Str.indexOf(",");
    if (commaIdx !== -1) {
      data = base64Str.substring(commaIdx + 1);
      const mimeStr = base64Str.substring(5, commaIdx).split(";")[0];
      if (mimeStr) {
        mimetype = mimeStr;
        if (mimeStr.startsWith("image/")) {
          ext = mimeStr.split("/")[1] || "png";
        } else if (mimeStr === "application/pdf") {
          ext = "pdf";
        } else if (mimeStr.startsWith("video/")) {
          ext = mimeStr.split("/")[1] || "mp4";
        } else if (mimeStr.startsWith("audio/")) {
          ext = mimeStr.split("/")[1] || "mp3";
        }
      }
    }

    const rawPrefix =
      (req.query?.prefix as string) ||
      (req.body?.prefix as string) ||
      (req.headers["x-prefix"] as string) ||
      "";
    const cleanPrefix = rawPrefix
      ? String(rawPrefix).replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase()
      : "";

    if (cleanPrefix) {
      prefix = cleanPrefix;
    } else if (mimetype.startsWith("image/")) {
      prefix = "profile";
    } else if (mimetype === "application/pdf") {
      prefix = "pdf";
    } else if (mimetype.startsWith("video/")) {
      prefix = "vid";
    } else if (mimetype.startsWith("audio/")) {
      prefix = "aud";
    } else {
      prefix = "media";
    }

    if (ext === "jpeg") ext = "jpg";

    const buffer = Buffer.from(data, "base64");
    const filename = `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, buffer);

    return buildFileResponse(req, filename, filename, mimetype, buffer.length);
  } catch (err) {
    console.error("Failed to write base64 media file:", err);
    return null;
  }
}

/**
 * Controller to handle media upload:
 * - Processes FormData multipart uploads (single or multiple files)
 * - Also handles base64 data URLs if passed in request body
 * - Saves into the uploads folder
 * - Returns the public URL, relative path, filename, and file metadata
 */
export async function handleMediaUpload(req: Request, res: Response) {
  try {
    const uploadedFiles = (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);

    const results: Array<ReturnType<typeof buildFileResponse>> = [];

    // 1. Process files from multipart/form-data
    if (uploadedFiles && uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        const item = buildFileResponse(
          req,
          file.filename,
          file.originalname,
          file.mimetype,
          file.size,
        );
        results.push(item);
      }
    }

    // 2. Process base64 / text fallback from body if no files uploaded via multipart
    if (results.length === 0 && req.body) {
      const candidates = [
        req.body.file,
        req.body.media,
        req.body.image,
        req.body.pdf,
        req.body.data,
      ];

      for (const cand of candidates) {
        if (!cand) continue;
        if (Array.isArray(cand)) {
          for (const item of cand) {
            const parsed = processBase64Content(
              req,
              typeof item === "string" ? item : item?.url || "",
            );
            if (parsed) results.push(parsed);
          }
        } else if (typeof cand === "string") {
          const parsed = processBase64Content(req, cand);
          if (parsed) results.push(parsed);
        } else if (typeof cand === "object" && cand.url) {
          const parsed = processBase64Content(req, cand.url);
          if (parsed) results.push(parsed);
        }
      }
    }

    if (results.length === 0) {
      return res.status(400).json({
        success: false,
        error:
          "No media file uploaded. Please upload a file using FormData with 'file', 'media', 'image', or any field name.",
      });
    }

    // Single file response format with multi-file support
    const primary = results[0];

    return res.status(200).json({
      success: true,
      message: "Media uploaded successfully",
      url: primary.url,
      path: primary.path,
      filename: primary.filename,
      originalName: primary.originalName,
      mimetype: primary.mimetype,
      size: primary.size,
      data: primary,
      files: results,
    });
  } catch (err: any) {
    console.error("Error in handleMediaUpload:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Internal server error during media upload",
    });
  }
}
