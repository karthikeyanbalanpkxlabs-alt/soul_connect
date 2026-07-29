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

export async function handleCustomerList(req: Request, res: Response, type?: any) {
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

    const dob = updateFields.dob !== undefined ? updateFields.dob : currentCustomer.get("dob");
    const gender = updateFields.gender !== undefined ? updateFields.gender : currentCustomer.get("gender");

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
            error: "Minimum legal marriage age for females in India is 18 years.",
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
        const existingPhone = await Customers.findOne({ phone_number: newPhoneNumber });
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
            error: "Minimum legal marriage age for females in India is 18 years.",
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
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      background-color: #F6F6F9;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F6F6F9;">
  <p>Hello ${first || "User"}, your account is successfully created.</p>
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
