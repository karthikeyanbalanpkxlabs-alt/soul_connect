import { Request, Response } from "express";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { Customers } from "../models/customer";
import { GLOBAL_DETAILS } from "../config/keycloak-admin";
import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import { EMAIL_TRIGGER_ENABLE_FLAG } from "../config/email";

const PORT = process.env.PORT || 3000;

function calculateAgeFromDob(dobStr?: string): number | null {
  if (!dobStr) return null;
  let year = 0,
    month = 0,
    day = 0;
  if (dobStr.includes("-")) {
    const parts = dobStr.split("-");
    if (parts[0].length === 4) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    } else {
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      year = parseInt(parts[2], 10);
    }
  } else if (dobStr.includes("/")) {
    const parts = dobStr.split("/");
    if (parts[0].length === 4) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    } else {
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      year = parseInt(parts[2], 10);
    }
  } else return null;

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  const birthDate = new Date(year, month, day);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export async function handleCustomerList(
  req: Request,
  res: Response,
  type?: any,
) {
  try {
    const filter = req.body.filter || {};
    const customer_type = req.body.customer_type || false;
    const limit = parseInt(req.body.limit) || 100;
    const skip = parseInt(req.body.skip) || 0;

    const tokenContent = (req as any).kauth?.grant?.access_token?.content;
    const loggedInKeycloakId = tokenContent?.sub;
    const loggedInEmail = tokenContent?.email;

    if (loggedInKeycloakId) {
      filter.keycloakId = { $ne: loggedInKeycloakId };
    }
    if (loggedInEmail) {
      filter.email = { $ne: loggedInEmail };
    }

    if (customer_type || type) {
      filter.public_verify = true;
    }

    let minAgeVal: number | undefined = undefined;
    let maxAgeVal: number | undefined = undefined;

    const reqFilters = req.body.filters || {};
    for (const key of Object.keys(reqFilters)) {
      const val = reqFilters[key];
      if (val !== undefined && val !== null && val !== "") {
        if (key === "min_age" || key === "minAge") {
          const parsed = Number(val);
          if (!isNaN(parsed)) minAgeVal = parsed;
          continue;
        }
        if (key === "max_age" || key === "maxAge") {
          const parsed = Number(val);
          if (!isNaN(parsed)) maxAgeVal = parsed;
          continue;
        }
        let dbKey = key;
        if (key === "firstName") dbKey = "first_name";
        if (key === "lastName") dbKey = "last_name";
        if (key === "approvalStatus" || key === "public_verify") {
          const lowerVal = String(val).toLowerCase();
          if ("approved".includes(lowerVal) || lowerVal === "true") {
            filter.public_verify = true;
          } else if (
            "wait for approval".includes(lowerVal) ||
            lowerVal === "false" ||
            lowerVal === "rejected"
          ) {
            filter.public_verify = false;
          } else {
            filter.public_verify = null;
          }
        } else if (key === "gender") {
          filter[dbKey] = { $regex: `^${val}$`, $options: "i" };
        } else {
          filter[dbKey] = { $regex: val, $options: "i" };
        }
      }
    }

    let sortOption: any = { _id: -1 };
    if (req.body.sort) {
      if (typeof req.body.sort === "object") {
        sortOption = req.body.sort;
      } else if (typeof req.body.sort === "string") {
        if (req.body.sort.toLowerCase() === "asc") {
          sortOption = { _id: 1 };
        } else if (req.body.sort.toLowerCase() === "desc") {
          sortOption = { _id: -1 };
        } else {
          const direction = req.body.order === "asc" ? 1 : -1;
          sortOption = { [req.body.sort]: direction };
        }
      }
    } else if (req.body.order) {
      if (req.body.order.toLowerCase() === "asc") {
        sortOption = { _id: 1 };
      } else {
        sortOption = { _id: -1 };
      }
    }

    let total = 0;
    let list: any[] = [];

    if (minAgeVal !== undefined || maxAgeVal !== undefined) {
      const allMatching = await Customers.find(filter).sort(sortOption);
      const filteredByAge = allMatching.filter((cust: any) => {
        const age =
          typeof cust.age === "number"
            ? cust.age
            : calculateAgeFromDob(cust.dob);
        if (age === null) return false;
        if (minAgeVal !== undefined && age < minAgeVal) return false;
        if (maxAgeVal !== undefined && age > maxAgeVal) return false;
        return true;
      });
      total = filteredByAge.length;
      list = filteredByAge.slice(skip, skip + limit);
    } else {
      total = await Customers.countDocuments(filter);
      list = await Customers.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit);
    }

    res.json({
      total,
      limit,
      skip,
      data: list,
    });
  } catch (err: any) {
    console.error("customer_list error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to fetch customer list" });
  }
}

export async function handleCustomerDetail(req: Request, res: Response) {
  try {
    const { id, customer_id, email, keycloakId } = req.body;
    let query: any = {};
    if (id) query._id = id;
    else if (customer_id) query.customer_id = customer_id;
    else if (email) query.email = email;
    else if (keycloakId) query.keycloakId = keycloakId;
    else {
      return res.status(400).json({
        error:
          "Missing identifier (id, customer_id, email, or keycloakId) in request body",
      });
    }

    const customer = await Customers.findOne(query);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  } catch (err: any) {
    console.error("customer_detail error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to fetch customer detail" });
  }
}

export async function handleCustomerDetailGet(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ error: "Missing identifier in request URL" });
    }

    const customer = await Customers.findById(id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  } catch (err: any) {
    console.error("customer_detail_get error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to fetch customer detail" });
  }
}

export async function handleProfileDetail(req: Request, res: Response) {
  try {
    const { email } = {
      ...req.query,
      ...req.body,
    };

    const targetEmail =
      (email as string) ||
      (req as any).kauth?.grant?.access_token?.content?.email;

    if (!targetEmail) {
      return res.status(400).json({
        error: "Missing email parameter in request",
      });
    }

    const profile = await Customers.findOne({ email: targetEmail });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json(profile);
  } catch (err: any) {
    console.error("profile_detail error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to fetch profile detail" });
  }
}

export async function handleProfileDetailGet(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    if (!id) {
      return res
        .status(400)
        .json({ error: "Missing identifier in request URL" });
    }

    let profile;
    if (mongoose.Types.ObjectId.isValid(id)) {
      profile = await Customers.findOne({
        $or: [{ _id: id }, { customer_id: id }, { keycloakId: id }],
      });
    } else {
      profile = await Customers.findOne({
        $or: [{ customer_id: id }, { keycloakId: id }, { email: id }],
      });
    }

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json(profile);
  } catch (err: any) {
    console.error("profile_detail_get error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to fetch profile detail" });
  }
}

function processUploadedImages(
  imagesInput: any[],
  req: Request,
): any[] | string {
  const savedImages = [];
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  for (let i = 0; i < imagesInput.length; i++) {
    const item = imagesInput[i];
    let imgStr = "";

    if (typeof item === "string") {
      imgStr = item;
    } else if (
      item &&
      typeof item === "object" &&
      typeof item.url === "string"
    ) {
      imgStr = item.url;
    } else {
      return `Invalid image item structure at index ${i}. Expected string or object with url property.`;
    }

    const isDefault =
      item && typeof item === "object" ? item.default === true : i === 0;

    if (
      imgStr.startsWith("http://") ||
      imgStr.startsWith("https://") ||
      (!imgStr.startsWith("data:") && imgStr.length < 200)
    ) {
      const imgObj: any = { url: imgStr };
      if (isDefault) {
        imgObj.default = true;
      }
      savedImages.push(imgObj);
      continue;
    }

    try {
      let ext = "png";
      let data = imgStr;

      if (imgStr.startsWith("data:")) {
        const commaIdx = imgStr.indexOf(",");
        if (commaIdx !== -1) {
          data = imgStr.substring(commaIdx + 1);
          const mimeStr = imgStr.substring(5, commaIdx);
          const mimeParts = mimeStr.split(";")[0].split("/");
          if (mimeParts.length === 2) {
            ext = mimeParts[1];
          }
        }
      }

      const buffer = Buffer.from(data, "base64");
      const filename = `img_${Date.now()}_${i}_${Math.floor(Math.random() * 1000)}.${ext}`;
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, buffer);

      const host = req.get("host");
      const imageUrl = `${req.protocol}://${host}/uploads/${filename}`;
      const imgObj: any = { url: imageUrl };
      if (isDefault) {
        imgObj.default = true;
      }
      savedImages.push(imgObj);
    } catch (err: any) {
      return `Failed to process image ${i + 1}: ${err.message}`;
    }
  }

  return savedImages;
}

function processUploadedVideo(
  videoInput: any,
  req: Request,
): { url: string } | string {
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  let vidStr = "";

  if (typeof videoInput === "string") {
    vidStr = videoInput;
  } else if (
    videoInput &&
    typeof videoInput === "object" &&
    typeof videoInput.url === "string"
  ) {
    vidStr = videoInput.url;
  } else {
    return "Invalid video item structure. Expected string or object with url property.";
  }

  if (
    vidStr.startsWith("http://") ||
    vidStr.startsWith("https://") ||
    (!vidStr.startsWith("data:") && vidStr.length < 200)
  ) {
    return { url: vidStr };
  }

  try {
    let ext = "mp4";
    let data = vidStr;

    if (vidStr.startsWith("data:")) {
      const commaIdx = vidStr.indexOf(",");
      if (commaIdx !== -1) {
        data = vidStr.substring(commaIdx + 1);
        const mimeStr = vidStr.substring(5, commaIdx);
        const mimeParts = mimeStr.split(";")[0].split("/");
        if (mimeParts.length === 2) {
          ext = mimeParts[1];
        }
      }
    }

    const buffer = Buffer.from(data, "base64");
    const filename = `vid_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, buffer);

    const host = req.get("host");
    const videoUrl = `${req.protocol}://${host}/uploads/${filename}`;
    return { url: videoUrl };
  } catch (err: any) {
    return `Failed to process video: ${err.message}`;
  }
}

function processUploadedIdentityProof(
  identityProofInput: any,
  req: Request,
): { url: string } | string {
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  let fileStr = "";

  if (typeof identityProofInput === "string") {
    fileStr = identityProofInput;
  } else if (
    identityProofInput &&
    typeof identityProofInput === "object" &&
    typeof identityProofInput.url === "string"
  ) {
    fileStr = identityProofInput.url;
  } else {
    return "Invalid identity proof structure. Expected string or object with url property.";
  }

  if (
    fileStr.startsWith("http://") ||
    fileStr.startsWith("https://") ||
    (!fileStr.startsWith("data:") && fileStr.length < 200)
  ) {
    return { url: fileStr };
  }

  try {
    let ext = "png";
    let data = fileStr;

    if (fileStr.startsWith("data:")) {
      const commaIdx = fileStr.indexOf(",");
      if (commaIdx !== -1) {
        data = fileStr.substring(commaIdx + 1);
        const mimeStr = fileStr.substring(5, commaIdx);
        const mimeParts = mimeStr.split(";")[0].split("/");
        if (mimeParts.length === 2) {
          ext = mimeParts[1];
        }
      }
    }

    const buffer = Buffer.from(data, "base64");
    const filename = `id_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, buffer);

    const host = req.get("host");
    const fileUrl = `${req.protocol}://${host}/uploads/${filename}`;
    return { url: fileUrl };
  } catch (err: any) {
    return `Failed to process identity proof: ${err.message}`;
  }
}

function processUploadedHealthReport(
  healthReportInput: any,
  req: Request,
): { url: string } | string {
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  let fileStr = "";

  if (typeof healthReportInput === "string") {
    fileStr = healthReportInput;
  } else if (
    healthReportInput &&
    typeof healthReportInput === "object" &&
    typeof healthReportInput.url === "string"
  ) {
    fileStr = healthReportInput.url;
  } else {
    return "Invalid health report structure. Expected string or object with url property.";
  }

  if (
    fileStr.startsWith("http://") ||
    fileStr.startsWith("https://") ||
    (!fileStr.startsWith("data:") && fileStr.length < 200)
  ) {
    return { url: fileStr };
  }

  try {
    let ext = "png";
    let data = fileStr;

    if (fileStr.startsWith("data:")) {
      const commaIdx = fileStr.indexOf(",");
      if (commaIdx !== -1) {
        data = fileStr.substring(commaIdx + 1);
        const mimeStr = fileStr.substring(5, commaIdx);
        const mimeParts = mimeStr.split(";")[0].split("/");
        if (mimeParts.length === 2) {
          ext = mimeParts[1];
        }
      }
    }

    const buffer = Buffer.from(data, "base64");
    const filename = `health_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, buffer);

    const host = req.get("host");
    const fileUrl = `${req.protocol}://${host}/uploads/${filename}`;
    return { url: fileUrl };
  } catch (err: any) {
    return `Failed to process health report: ${err.message}`;
  }
}

function processUploadedJathagam(
  jathagamInput: any,
  req: Request,
): { url: string } | string | null {
  if (!jathagamInput) return null;
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  let fileStr = "";
  if (typeof jathagamInput === "string") {
    fileStr = jathagamInput;
  } else if (
    jathagamInput &&
    typeof jathagamInput === "object" &&
    typeof jathagamInput.url === "string"
  ) {
    fileStr = jathagamInput.url;
  } else {
    return null;
  }

  if (!fileStr) return null;

  if (
    fileStr.startsWith("http://") ||
    fileStr.startsWith("https://") ||
    (!fileStr.startsWith("data:") && fileStr.length < 200)
  ) {
    return { url: fileStr };
  }

  try {
    let ext = "pdf";
    let data = fileStr;

    if (fileStr.startsWith("data:")) {
      const commaIdx = fileStr.indexOf(",");
      if (commaIdx !== -1) {
        data = fileStr.substring(commaIdx + 1);
        const mimeStr = fileStr.substring(5, commaIdx);
        const mimeParts = mimeStr.split(";")[0].split("/");
        if (mimeParts.length === 2) {
          ext = mimeParts[1];
        }
      }
    }

    const buffer = Buffer.from(data, "base64");
    const filename = `jathagam_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, buffer);

    const host = req.get("host");
    const fileUrl = `${req.protocol}://${host}/uploads/${filename}`;
    return { url: fileUrl };
  } catch (err: any) {
    console.error("Failed to process jathagam:", err);
    return `Failed to process jathagam: ${err.message}`;
  }
}

function processUploadedFamilyPhotos(
  familyPhotosInput: any,
  req: Request,
): { url: string }[] | string {
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  let items: any[] = [];
  if (Array.isArray(familyPhotosInput)) {
    items = familyPhotosInput;
  } else if (
    familyPhotosInput !== null &&
    familyPhotosInput !== undefined &&
    familyPhotosInput !== ""
  ) {
    items = [familyPhotosInput];
  } else {
    return [];
  }

  if (items.length < 1) {
    return "Invalid family photos upload. Family photo is required (minimum 1 photo).";
  }

  if (items.length > 1) {
    return "Invalid family photos upload. Maximum 1 photo allowed.";
  }

  const savedPhotos: { url: string }[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let imgStr = "";

    if (typeof item === "string") {
      imgStr = item;
    } else if (
      item &&
      typeof item === "object" &&
      typeof item.url === "string"
    ) {
      imgStr = item.url;
    } else {
      return `Invalid family photo structure at index ${i}. Expected string or object with url property.`;
    }

    if (
      imgStr.startsWith("http://") ||
      imgStr.startsWith("https://") ||
      (!imgStr.startsWith("data:") && imgStr.length < 200)
    ) {
      savedPhotos.push({ url: imgStr });
      continue;
    }

    try {
      let ext = "png";
      let data = imgStr;

      if (imgStr.startsWith("data:")) {
        const commaIdx = imgStr.indexOf(",");
        if (commaIdx !== -1) {
          data = imgStr.substring(commaIdx + 1);
          const mimeStr = imgStr.substring(5, commaIdx);
          const mimeParts = mimeStr.split(";")[0].split("/");
          if (mimeParts.length === 2) {
            ext = mimeParts[1];
          }
        }
      }

      const buffer = Buffer.from(data, "base64");
      const filename = `family_photo_${Date.now()}_${i}_${Math.floor(Math.random() * 1000)}.${ext}`;
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, buffer);

      const host = req.get("host");
      const imageUrl = `${req.protocol}://${host}/uploads/${filename}`;
      savedPhotos.push({ url: imageUrl });
    } catch (err: any) {
      return `Failed to process family photo ${i + 1}: ${err.message}`;
    }
  }

  return savedPhotos;
}

export async function handleCustomerEdit(req: Request, res: Response) {
  try {
    const { id, customer_id, email, keycloakId, ...updateFields } = req.body;
    let query: any = {};
    if (id) query._id = id;
    else if (customer_id) query.customer_id = customer_id;
    else if (email) query.email = email;
    else if (keycloakId) query.keycloakId = keycloakId;
    else {
      return res.status(400).json({
        error:
          "Missing identifier (id, customer_id, email, or keycloakId) in request body",
      });
    }

    const currentCustomer = await Customers.findOne(query);
    if (!currentCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const dob =
      updateFields.dob !== undefined
        ? updateFields.dob
        : currentCustomer.get("dob");
    const gender =
      updateFields.gender !== undefined
        ? updateFields.gender
        : currentCustomer.get("gender");

    if (dob && gender) {
      const age = calculateAgeFromDob(dob);
      if (age !== null) {
        const lowerGender = String(gender).toLowerCase();
        if (lowerGender === "male" && age < 21) {
          return res.status(400).json({
            error: "Minimum legal marriage age for males in India is 21 years.",
          });
        }
        if (lowerGender === "female" && age < 18) {
          return res.status(400).json({
            error:
              "Minimum legal marriage age for females in India is 18 years.",
          });
        }
      }
    }

    if (email && email.trim() !== "") {
      if (email !== currentCustomer.email) {
        const existingEmail = await Customers.findOne({ email });
        if (existingEmail) {
          return res
            .status(400)
            .json({ error: "Customer with this email already exists" });
        }
        updateFields.email = email;
      }
    }

    const newPhoneNumber = updateFields.phone_number;
    if (newPhoneNumber && newPhoneNumber.trim() !== "") {
      if (newPhoneNumber !== currentCustomer.get("phone_number")) {
        const existingPhone = await Customers.findOne({
          phone_number: newPhoneNumber,
        });
        if (existingPhone) {
          return res
            .status(400)
            .json({ error: "Customer with this phone number already exists" });
        }
      }
    }

    if (updateFields._id) {
      delete updateFields._id;
    }

    if (updateFields.firstName && !updateFields.first_name) {
      updateFields.first_name = updateFields.firstName;
    }
    if (updateFields.lastName && !updateFields.last_name) {
      updateFields.last_name = updateFields.lastName;
    }

    const imagesInput = updateFields.image || updateFields.images;
    if (imagesInput !== undefined) {
      if (!Array.isArray(imagesInput)) {
        return res
          .status(400)
          .json({ error: "Invalid image upload. Expected array." });
      }
      if (imagesInput.length < 1 || imagesInput.length > 5) {
        return res.status(400).json({
          error:
            "Invalid image upload. Must upload minimum 1 and maximum 5 images.",
        });
      }
      const processed = processUploadedImages(imagesInput, req);
      if (typeof processed === "string") {
        return res.status(400).json({ error: processed });
      }
      updateFields.image = processed;
      if (updateFields.images) {
        delete updateFields.images;
      }
    }

    const videoInput = updateFields.video;
    if (videoInput !== undefined) {
      if (videoInput === null || videoInput === "") {
        updateFields.video = null;
      } else {
        const processed = processUploadedVideo(videoInput, req);
        if (typeof processed === "string") {
          return res.status(400).json({ error: processed });
        }
        updateFields.video = processed;
      }
    }

    const identityProofInput = updateFields.identity_proff;
    if (identityProofInput !== undefined) {
      if (identityProofInput === null || identityProofInput === "") {
        updateFields.identity_proff = null;
      } else {
        const processed = processUploadedIdentityProof(identityProofInput, req);
        if (typeof processed === "string") {
          return res.status(400).json({ error: processed });
        }
        updateFields.identity_proff = processed;
      }
    }

    const healthReportInput = updateFields.health_report;
    if (healthReportInput !== undefined) {
      if (healthReportInput === null || healthReportInput === "") {
        updateFields.health_report = null;
      } else {
        const processed = processUploadedHealthReport(healthReportInput, req);
        if (typeof processed === "string") {
          return res.status(400).json({ error: processed });
        }
        updateFields.health_report = processed;
      }
    }

    const familyPhotosInput =
      updateFields.family_photos !== undefined
        ? updateFields.family_photos
        : updateFields.family_photo;
    if (familyPhotosInput !== undefined) {
      if (
        familyPhotosInput === null ||
        familyPhotosInput === "" ||
        (Array.isArray(familyPhotosInput) && familyPhotosInput.length === 0)
      ) {
        return res.status(400).json({
          error: "Invalid family photos upload. Family photo is required (minimum 1 photo).",
        });
      } else {
        const processed = processUploadedFamilyPhotos(familyPhotosInput, req);
        if (typeof processed === "string") {
          return res.status(400).json({ error: processed });
        }
        updateFields.family_photos = processed;
        if (updateFields.family_photo) delete updateFields.family_photo;
      }
    }

    if (
      updateFields.horoscopeDetails !== undefined ||
      updateFields.star ||
      updateFields.rasi ||
      updateFields.lagnam ||
      updateFields.gothram ||
      updateFields.tob ||
      updateFields.pob ||
      updateFields.dosham ||
      updateFields.manglik ||
      updateFields.chevvai_dosham ||
      updateFields.rahu_ketu_dosham ||
      updateFields.jathagam
    ) {
      const existingHoro = currentCustomer.get("horoscopeDetails") || {};
      const newHoroInput = updateFields.horoscopeDetails || {};
      updateFields.horoscopeDetails = {
        ...existingHoro,
        ...newHoroInput,
        dob:
          newHoroInput.dob !== undefined
            ? newHoroInput.dob
            : updateFields.dob !== undefined
            ? updateFields.dob
            : existingHoro.dob || currentCustomer.get("dob") || "",
        star:
          newHoroInput.star !== undefined
            ? newHoroInput.star
            : updateFields.star !== undefined
            ? updateFields.star
            : existingHoro.star || currentCustomer.get("star") || "",
        rasi:
          newHoroInput.rasi !== undefined
            ? newHoroInput.rasi
            : updateFields.rasi !== undefined
            ? updateFields.rasi
            : existingHoro.rasi || currentCustomer.get("rasi") || "",
        lagnam:
          newHoroInput.lagnam !== undefined
            ? newHoroInput.lagnam
            : updateFields.lagnam !== undefined
            ? updateFields.lagnam
            : existingHoro.lagnam || currentCustomer.get("lagnam") || "",
        gothram:
          newHoroInput.gothram !== undefined
            ? newHoroInput.gothram
            : updateFields.gothram !== undefined
            ? updateFields.gothram
            : existingHoro.gothram || currentCustomer.get("gothram") || "",
        tob:
          newHoroInput.tob !== undefined
            ? newHoroInput.tob
            : updateFields.tob !== undefined
            ? updateFields.tob
            : existingHoro.tob || currentCustomer.get("tob") || "",
        pob:
          newHoroInput.pob !== undefined
            ? newHoroInput.pob
            : updateFields.pob !== undefined
            ? updateFields.pob
            : existingHoro.pob || currentCustomer.get("pob") || "",
        dosham:
          newHoroInput.dosham !== undefined
            ? newHoroInput.dosham
            : updateFields.dosham !== undefined
            ? updateFields.dosham
            : existingHoro.dosham || currentCustomer.get("dosham") || "No Dosham",
        manglik:
          newHoroInput.manglik !== undefined
            ? newHoroInput.manglik
            : updateFields.manglik !== undefined
            ? updateFields.manglik
            : existingHoro.manglik || currentCustomer.get("manglik") || "No",
        chevvai_dosham:
          newHoroInput.chevvai_dosham !== undefined
            ? newHoroInput.chevvai_dosham
            : updateFields.chevvai_dosham !== undefined
            ? updateFields.chevvai_dosham
            : existingHoro.chevvai_dosham ||
              currentCustomer.get("chevvai_dosham") ||
              "No",
        rahu_ketu_dosham:
          newHoroInput.rahu_ketu_dosham !== undefined
            ? newHoroInput.rahu_ketu_dosham
            : updateFields.rahu_ketu_dosham !== undefined
            ? updateFields.rahu_ketu_dosham
            : existingHoro.rahu_ketu_dosham ||
              currentCustomer.get("rahu_ketu_dosham") ||
              "Neutral",
        jathagam: (() => {
          const rawJath =
            newHoroInput.jathagam !== undefined
              ? newHoroInput.jathagam
              : updateFields.jathagam !== undefined
              ? updateFields.jathagam
              : existingHoro.jathagam || currentCustomer.get("jathagam") || null;
          if (!rawJath) return null;
          const processed = processUploadedJathagam(rawJath, req);
          return typeof processed === "string" ? rawJath : processed;
        })(),
      };
    }

    if (
      updateFields.familyBackground !== undefined ||
      updateFields.father_name ||
      updateFields.father_occupation ||
      updateFields.mother_name ||
      updateFields.mother_occupation ||
      updateFields.siblings ||
      updateFields.family_type ||
      updateFields.family_status ||
      updateFields.family_address ||
      updateFields.family_values ||
      updateFields.about_family
    ) {
      const existingFam = currentCustomer.get("familyBackground") || {};
      const newFamInput = updateFields.familyBackground || {};
      updateFields.familyBackground = {
        ...existingFam,
        ...newFamInput,
        father_name:
          newFamInput.father_name !== undefined
            ? newFamInput.father_name
            : updateFields.father_name !== undefined
            ? updateFields.father_name
            : existingFam.father_name || "",
        father_occupation:
          newFamInput.father_occupation !== undefined
            ? newFamInput.father_occupation
            : updateFields.father_occupation !== undefined
            ? updateFields.father_occupation
            : existingFam.father_occupation || "",
        mother_name:
          newFamInput.mother_name !== undefined
            ? newFamInput.mother_name
            : updateFields.mother_name !== undefined
            ? updateFields.mother_name
            : existingFam.mother_name || "",
        mother_occupation:
          newFamInput.mother_occupation !== undefined
            ? newFamInput.mother_occupation
            : updateFields.mother_occupation !== undefined
            ? updateFields.mother_occupation
            : existingFam.mother_occupation || "",
        siblings:
          newFamInput.siblings !== undefined
            ? newFamInput.siblings
            : updateFields.siblings !== undefined
            ? updateFields.siblings
            : existingFam.siblings || "",
        siblings_details:
          newFamInput.siblings_details !== undefined
            ? newFamInput.siblings_details
            : updateFields.siblings_details !== undefined
            ? updateFields.siblings_details
            : existingFam.siblings_details || "",
        family_type:
          newFamInput.family_type !== undefined
            ? newFamInput.family_type
            : updateFields.family_type !== undefined
            ? updateFields.family_type
            : existingFam.family_type || "",
        family_type_details:
          newFamInput.family_type_details !== undefined
            ? newFamInput.family_type_details
            : updateFields.family_type_details !== undefined
            ? updateFields.family_type_details
            : existingFam.family_type_details || "",
        family_status:
          newFamInput.family_status !== undefined
            ? newFamInput.family_status
            : updateFields.family_status !== undefined
            ? updateFields.family_status
            : existingFam.family_status || "",
        family_status_details:
          newFamInput.family_status_details !== undefined
            ? newFamInput.family_status_details
            : updateFields.family_status_details !== undefined
            ? updateFields.family_status_details
            : existingFam.family_status_details || "",
        family_address:
          newFamInput.family_address !== undefined
            ? newFamInput.family_address
            : updateFields.family_address !== undefined
            ? updateFields.family_address
            : existingFam.family_address || "",
        family_values:
          newFamInput.family_values !== undefined
            ? newFamInput.family_values
            : updateFields.family_values !== undefined
            ? updateFields.family_values
            : existingFam.family_values || "",
        family_values_details:
          newFamInput.family_values_details !== undefined
            ? newFamInput.family_values_details
            : updateFields.family_values_details !== undefined
            ? updateFields.family_values_details
            : existingFam.family_values_details || "",
        about_family:
          newFamInput.about_family !== undefined
            ? newFamInput.about_family
            : updateFields.about_family !== undefined
            ? updateFields.about_family
            : existingFam.about_family || "",
        about_family_tamil:
          newFamInput.about_family_tamil !== undefined
            ? newFamInput.about_family_tamil
            : updateFields.about_family_tamil !== undefined
            ? updateFields.about_family_tamil
            : existingFam.about_family_tamil || "",
      };
    }

    if (
      updateFields.lifeStyle !== undefined ||
      updateFields.diet ||
      updateFields.smoking ||
      updateFields.drinking ||
      updateFields.living_with ||
      updateFields.willing_to_relocate ||
      updateFields.interests
    ) {
      const existingLife = currentCustomer.get("lifeStyle") || {};
      const newLifeInput = updateFields.lifeStyle || {};
      updateFields.lifeStyle = {
        ...existingLife,
        ...newLifeInput,
        diet:
          newLifeInput.diet !== undefined
            ? newLifeInput.diet
            : updateFields.diet !== undefined
            ? updateFields.diet
            : existingLife.diet || "",
        smoking:
          newLifeInput.smoking !== undefined
            ? newLifeInput.smoking
            : updateFields.smoking !== undefined
            ? updateFields.smoking
            : existingLife.smoking || "",
        drinking:
          newLifeInput.drinking !== undefined
            ? newLifeInput.drinking
            : updateFields.drinking !== undefined
            ? updateFields.drinking
            : existingLife.drinking || "",
        living_with:
          newLifeInput.living_with !== undefined
            ? newLifeInput.living_with
            : updateFields.living_with !== undefined
            ? updateFields.living_with
            : existingLife.living_with || "",
        willing_to_relocate:
          newLifeInput.willing_to_relocate !== undefined
            ? newLifeInput.willing_to_relocate
            : updateFields.willing_to_relocate !== undefined
            ? updateFields.willing_to_relocate
            : existingLife.willing_to_relocate || "",
        interests:
          newLifeInput.interests !== undefined
            ? newLifeInput.interests
            : updateFields.interests !== undefined
            ? updateFields.interests
            : existingLife.interests || "",
      };
    }

    const tokenContent = (req as any).kauth?.grant?.access_token?.content;
    const loggedInEmail = tokenContent?.email;

    updateFields.modifiedAtTime = new Date();
    if (loggedInEmail) {
      updateFields.modifiedByemail = loggedInEmail;
    } else if (email) {
      updateFields.modifiedByemail = email;
    }

    const customer = await Customers.findOneAndUpdate(
      query,
      { $set: updateFields },
      { new: true, runValidators: true },
    );

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json({
      success: true,
      message: "Customer updated successfully",
      customer,
    });
  } catch (err: any) {
    console.error("customer_edit error:", err);
    res.status(500).json({ error: err.message || "Failed to update customer" });
  }
}

export async function handleCustomerDelete(req: Request, res: Response) {
  try {
    const { id, customer_id, email, keycloakId } = req.body;
    let query: any = {};
    if (id) query._id = id;
    else if (customer_id) query.customer_id = customer_id;
    else if (email) query.email = email;
    else if (keycloakId) query.keycloakId = keycloakId;
    else {
      return res.status(400).json({
        error:
          "Missing identifier (id, customer_id, email, or keycloakId) in request body",
      });
    }

    const customer = await Customers.findOneAndDelete(query);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json({ success: true, message: "Customer deleted successfully" });
  } catch (err: any) {
    console.error("customer_delete error:", err);
    res.status(500).json({ error: err.message || "Failed to delete customer" });
  }
}

export async function handleCustomerCreate(req: Request, res: Response) {
  try {
    const {
      firstName,
      lastName,
      first_name,
      last_name,
      email,
      image,
      images,
      video,
      role,
      identity_proff,
      health_report,
      family_photos,
      family_photo,
      ...otherFields
    } = req?.body;

    const dob = req?.body?.dob;
    const gender = req?.body?.gender;

    if (dob && gender) {
      const age = calculateAgeFromDob(dob);
      if (age !== null) {
        const lowerGender = String(gender).toLowerCase();
        if (lowerGender === "male" && age < 21) {
          return res.status(400).json({
            error: "Minimum legal marriage age for males in India is 21 years.",
          });
        }
        if (lowerGender === "female" && age < 18) {
          return res.status(400).json({
            error:
              "Minimum legal marriage age for females in India is 18 years.",
          });
        }
      }
    }

    const imagesInput = image || images;
    if (
      !imagesInput ||
      !Array.isArray(imagesInput) ||
      imagesInput.length < 1 ||
      imagesInput.length > 5
    ) {
      return res.status(400).json({
        error:
          "Invalid image upload. Must upload minimum 1 and maximum 5 images.",
      });
    }

    const processed = processUploadedImages(imagesInput, req);
    if (typeof processed === "string") {
      return res.status(400).json({ error: processed });
    }

    let processedVideo = undefined;
    if (video !== undefined && video !== null && video !== "") {
      const processedVid = processUploadedVideo(video, req);
      if (typeof processedVid === "string") {
        return res.status(400).json({ error: processedVid });
      }
      processedVideo = processedVid;
    }

    let processedIdentityProof = undefined;
    if (
      identity_proff !== undefined &&
      identity_proff !== null &&
      identity_proff !== ""
    ) {
      const processedId = processUploadedIdentityProof(identity_proff, req);
      if (typeof processedId === "string") {
        return res.status(400).json({ error: processedId });
      }
      processedIdentityProof = processedId;
    }

    let processedHealthReport = undefined;
    if (
      health_report !== undefined &&
      health_report !== null &&
      health_report !== ""
    ) {
      const processedHealth = processUploadedHealthReport(health_report, req);
      if (typeof processedHealth === "string") {
        return res.status(400).json({ error: processedHealth });
      }
      processedHealthReport = processedHealth;
    }

    const familyPhotosInput =
      family_photos !== undefined ? family_photos : family_photo;
    if (
      familyPhotosInput === undefined ||
      familyPhotosInput === null ||
      familyPhotosInput === "" ||
      (Array.isArray(familyPhotosInput) && familyPhotosInput.length === 0)
    ) {
      return res.status(400).json({
        error: "Invalid family photos upload. Family photo is required (minimum 1 photo).",
      });
    }
    const processedFP = processUploadedFamilyPhotos(familyPhotosInput, req);
    if (typeof processedFP === "string") {
      return res.status(400).json({ error: processedFP });
    }
    const processedFamilyPhotos = processedFP;

    const rawHoro = req.body.horoscopeDetails || {};
    const processedHoroscopeDetails = {
      dob: rawHoro.dob || req.body.dob || "",
      star: rawHoro.star || req.body.star || "",
      rasi: rawHoro.rasi || req.body.rasi || "",
      lagnam: rawHoro.lagnam || req.body.lagnam || "",
      gothram: rawHoro.gothram || req.body.gothram || "",
      tob: rawHoro.tob || req.body.tob || "",
      pob: rawHoro.pob || req.body.pob || "",
      dosham: rawHoro.dosham || req.body.dosham || "No Dosham",
      manglik: rawHoro.manglik || req.body.manglik || "No",
      chevvai_dosham:
        rawHoro.chevvai_dosham || req.body.chevvai_dosham || "No",
      rahu_ketu_dosham:
        rawHoro.rahu_ketu_dosham || req.body.rahu_ketu_dosham || "Neutral",
      jathagam: (() => {
        const rawJath = rawHoro.jathagam || req.body.jathagam || null;
        if (!rawJath) return null;
        const processed = processUploadedJathagam(rawJath, req);
        return typeof processed === "string" ? rawJath : processed;
      })(),
    };

    const rawFam = req.body.familyBackground || {};
    const processedFamilyBackground = {
      father_name: rawFam.father_name || req.body.father_name || "",
      father_occupation:
        rawFam.father_occupation || req.body.father_occupation || "",
      mother_name: rawFam.mother_name || req.body.mother_name || "",
      mother_occupation:
        rawFam.mother_occupation || req.body.mother_occupation || "",
      siblings: rawFam.siblings || req.body.siblings || "",
      siblings_details:
        rawFam.siblings_details || req.body.siblings_details || "",
      family_type: rawFam.family_type || req.body.family_type || "",
      family_type_details:
        rawFam.family_type_details || req.body.family_type_details || "",
      family_status: rawFam.family_status || req.body.family_status || "",
      family_status_details:
        rawFam.family_status_details || req.body.family_status_details || "",
      family_address: rawFam.family_address || req.body.family_address || "",
      family_values: rawFam.family_values || req.body.family_values || "",
      family_values_details:
        rawFam.family_values_details || req.body.family_values_details || "",
      about_family: rawFam.about_family || req.body.about_family || "",
      about_family_tamil:
        rawFam.about_family_tamil || req.body.about_family_tamil || "",
    };

    const rawLife = req.body.lifeStyle || {};
    const processedLifeStyle = {
      diet: rawLife.diet || req.body.diet || "",
      smoking: rawLife.smoking || req.body.smoking || "",
      drinking: rawLife.drinking || req.body.drinking || "",
      living_with: rawLife.living_with || req.body.living_with || "",
      willing_to_relocate:
        rawLife.willing_to_relocate || req.body.willing_to_relocate || "",
      interests: rawLife.interests || req.body.interests || "",
    };

    if (email && email.trim() !== "") {
      const existing = await Customers.findOne({ email });
      if (existing) {
        return res
          .status(400)
          .json({ error: "Customer with this email already exists" });
      }
    }

    const phone_number = req.body.phone_number;
    if (phone_number && phone_number.trim() !== "") {
      const existingPhone = await Customers.findOne({ phone_number });
      if (existingPhone) {
        return res
          .status(400)
          .json({ error: "Customer with this phone number already exists" });
      }
    }

    const first = firstName || first_name;
    const last = lastName || last_name;
    const customer_id =
      req.body.customer_id || `cid_${new mongoose.Types.ObjectId()}`;

    let keycloakId = undefined;
    try {
      const kcAdmin = new KeycloakAdminClient({
        baseUrl: process.env.KEYCLOAK_URL || "http://localhost:4000",
        realmName: "master",
      });

      await kcAdmin.auth({
        ...GLOBAL_DETAILS,
        grantType: "password",
        clientId: "admin-cli",
      });

      kcAdmin.setConfig({
        realmName: process.env.KEYCLOAK_REALM || "soul_connect",
      });

      const kcUser = await kcAdmin.users.create({
        username: first || email,
        email,
        firstName: first,
        lastName: last,
        enabled: true,
        emailVerified: true,
        credentials: [
          {
            type: "password",
            value: "password@123",
            temporary: true,
          },
        ],
      });
      keycloakId = kcUser.id;
      console.log("✅ Inner Keycloak User created with ID:", keycloakId);

      if (role) {
        try {
          const groups = await kcAdmin.groups.find({ search: role });
          const targetGroup = groups.find((g: any) => g.name === role);
          if (targetGroup && targetGroup.id) {
            await kcAdmin.users.addToGroup({
              id: keycloakId,
              groupId: targetGroup.id,
            });
            console.log(`... Added Keycloak user to group: ${role}`);
          } else {
            console.log(`... Keycloak group not found: ${role}`);
          }
        } catch (groupErr: any) {
          console.error(
            `... Failed to assign group ${role} in Keycloak:`,
            groupErr.message || groupErr,
          );
        }

        try {
          const realmRole = await kcAdmin.roles.findOneByName({ name: role });
          if (realmRole && realmRole.id && realmRole.name) {
            await kcAdmin.users.addRealmRoleMappings({
              id: keycloakId,
              roles: [{ id: realmRole.id, name: realmRole.name }],
            });
            console.log(`... Assigned Keycloak realm role: ${role}`);
          } else {
            console.log(`... Keycloak realm role not found: ${role}`);
          }
        } catch (roleErr: any) {
          console.error(
            `... Failed to assign realm role ${role} in Keycloak:`,
            roleErr.message || roleErr,
          );
        }
      }
    } catch (kcErr: any) {
      console.error(
        "... Keycloak user creation failed:",
        kcErr.response?.data || kcErr.message,
      );
      return res.status(400).json({
        error: `Failed to create Keycloak user: ${kcErr.response?.data?.errorMessage || kcErr.message}`,
      });
    }

    const tokenContent = (req as any).kauth?.grant?.access_token?.content;
    const loggedInEmail = tokenContent?.email;

    const newCustomer = new Customers({
      customer_id,
      keycloakId,
      firstName: first,
      lastName: last,
      first_name: first,
      last_name: last,
      email,
      image: processed,
      video: processedVideo,
      identity_proff: processedIdentityProof,
      health_report: processedHealthReport,
      family_photos: processedFamilyPhotos,
      horoscopeDetails: processedHoroscopeDetails,
      familyBackground: processedFamilyBackground,
      lifeStyle: processedLifeStyle,
      role,
      createdAtTime: new Date(),
      modifiedAtTime: new Date(),
      modifiedByemail: loggedInEmail || email || undefined,
      ...otherFields,
    });

    await newCustomer.save();

    if (EMAIL_TRIGGER_ENABLE_FLAG) {
      try {
        if (email) {
          const protocol = req.secure ? "https" : "http";
          const host = req.headers.host || `localhost:${PORT}`;

          const emailHtml = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>Welcome to Soul Connect</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      background-color: #F6F6F9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    table {
      border-collapse: collapse !important;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F6F6F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F6F6F9; padding: 40px 10px;">
    <tr>
      <td align="center" valign="top">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          
          <!-- HEADER -->
          <tr>
            <td style="background: #7C3AED; background: linear-gradient(135deg, #F2688C 0%, #7C3AED 100%); padding: 35px 40px; text-align: left;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">Soul Connect</h1>
                    <p style="margin: 6px 0 0 0; color: rgba(255,255,255,0.85); font-size: 13px;">Connecting Hearts, Building Relationships</p>
                  </td>
                  <td align="right" valign="top" style="color: #ffffff; font-size: 14px; font-weight: 500; opacity: 0.9;">
                    Welcome!
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding: 40px; background-color: #ffffff;">
              <!-- GREETING -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td width="48" valign="middle">
                    <div style="background-color: #EEF2FF; width: 44px; height: 44px; border-radius: 50%; text-align: center; line-height: 44px; font-size: 22px;">
                      👋
                    </div>
                  </td>
                  <td style="padding-left: 16px;" valign="middle">
                    <h2 style="margin: 0; color: #1F2937; font-size: 24px; font-weight: bold; line-height: 1.2;">
                      Hello, <span style="color: #7C3AED;">${first || "User"}</span>!
                    </h2>
                  </td>
                </tr>
              </table>

              <!-- WELCOME MESSAGE -->
              <p style="margin: 0 0 28px 0; color: #4B5563; font-size: 15px; line-height: 1.6;">
                Your Soul Connect account has been successfully created. We're excited to have you join our community!
              </p>

              <!-- ACCOUNT DETAILS BOX -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F9F8FF; border: 1px solid #EEF2FF; border-radius: 12px; padding: 24px; margin-bottom: 28px;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 20px 0; color: #7C3AED; font-size: 16px; font-weight: 700; letter-spacing: -0.2px;">Your Account Details</h3>
                    
                    <!-- Username -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px; border-bottom: 1px dashed #E0DBFA; padding-bottom: 12px;">
                      <tr>
                        <td width="36" valign="middle">
                          <div style="background-color: #EEF2FF; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-size: 13px;">
                            👤
                          </div>
                        </td>
                        <td style="color: #4B5563; font-size: 14px; font-weight: 600;" width="140" valign="middle">
                          Username
                        </td>
                        <td style="color: #1F2937; font-size: 14px; font-weight: bold; font-family: monospace;" valign="middle">
                          ${first || email}
                        </td>
                      </tr>
                    </table>

                    <!-- Email -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px; border-bottom: 1px dashed #E0DBFA; padding-bottom: 12px;">
                      <tr>
                        <td width="36" valign="middle">
                          <div style="background-color: #F3E8FF; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-size: 13px;">
                            ✉️
                          </div>
                        </td>
                        <td style="color: #4B5563; font-size: 14px; font-weight: 600;" width="140" valign="middle">
                          Email Address
                        </td>
                        <td style="color: #1F2937; font-size: 14px;" valign="middle">
                          <a href="mailto:${email}" style="color: #7C3AED; text-decoration: underline;">${email}</a>
                        </td>
                      </tr>
                    </table>

                    <!-- Password -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                      <tr>
                        <td width="36" valign="middle">
                          <div style="background-color: #FEF3C7; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-size: 13px;">
                            🔑
                          </div>
                        </td>
                        <td style="color: #4B5563; font-size: 14px; font-weight: 600;" width="140" valign="middle">
                          Temporary Password
                        </td>
                        <td style="color: #1F2937; font-size: 14px; font-weight: bold; font-family: monospace;" valign="middle">
                          password@123
                        </td>
                      </tr>
                    </table>

                    <!-- Security Alert -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFFDF5; border: 1px solid #FDE68A; border-radius: 8px; padding: 12px 16px;">
                      <tr>
                        <td width="24" valign="top" style="font-size: 14px;">
                          🛡️
                        </td>
                        <td style="color: #B45309; font-size: 13px; line-height: 1.4; font-weight: 500;">
                          For your security, please change your password after your first login.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- BUTTON -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="https://soulconect.com/portal/" target="_blank" style="display: inline-block; background-color: #7C3AED; background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: bold; padding: 14px 32px; border-radius: 30px; box-shadow: 0 4px 10px rgba(124,58,237,0.3); transition: all 0.2s;">
                      Login to Soul Connect &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- NOTICE -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #F3F4F6; padding-top: 20px;">
                <tr>
                  <td width="24" valign="top" style="font-size: 14px;">
                    ✅
                  </td>
                  <td style="color: #6B7280; font-size: 13px; line-height: 1.4; padding-left: 8px;">
                    If you did not request this account, please ignore this email or contact our support team immediately.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #F9FAFB; border-top: 1px solid #F3F4F6; padding: 35px 40px; text-align: center;">
              <h4 style="margin: 0 0 12px 0; color: #1F2937; font-size: 16px; font-weight: bold;">Soul Connect</h4>
              
              <!-- SOCIALS -->
              <table border="0" cellpadding="0" cellspacing="0" align="center" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 0 8px; font-size: 20px;">🔵</td>
                  <td style="padding: 0 8px; font-size: 20px;">📸</td>
                  <td style="padding: 0 8px; font-size: 20px;">🐦</td>
                  <td style="padding: 0 8px; font-size: 20px;">💼</td>
                </tr>
              </table>

              <p style="margin: 0 0 8px 0; color: #9CA3AF; font-size: 12px;">
                &copy; 2026 Soul Connect. All rights reserved.
              </p>
              <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                <a href="mailto:support@soulconnect.com" style="color: #7C3AED; text-decoration: none;">support@soulconnect.com</a>
                <span style="color: #D1D5DB; padding: 0 8px;">|</span>
                <a href="https://www.soulconnect.com" target="_blank" style="color: #7C3AED; text-decoration: none;">www.soulconnect.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

          console.log(`Triggering /api/send-email for ${email}...`);

          await fetch(`${protocol}://${host}/api/send-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: email,
              subject: "Welcome to Soul Connect - Account Created",
              message: emailHtml,
            }),
          });
        }
      } catch (emailErr: any) {
        console.error(
          "⚠️ Failed to trigger /api/send-email:",
          emailErr.message || emailErr,
        );
      }
    }

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customer: newCustomer,
    });
  } catch (err: any) {
    console.error("customer_create error:", err);
    res.status(500).json({ error: err.message || "Failed to create customer" });
  }
}
