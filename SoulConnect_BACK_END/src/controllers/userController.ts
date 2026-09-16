import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { UserInfo } from "../models/userInfo";
import { Customers } from "../models/customer";
import { getMasterAdminClient } from "../config/keycloak-admin";

function processSingleImage(imageInput: any, req: Request): any[] {
  if (!imageInput) return [];
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  let item = Array.isArray(imageInput) ? imageInput[0] : imageInput;
  let imgStr = typeof item === "string" ? item : item?.url || "";
  if (!imgStr) return [];

  if (
    imgStr.startsWith("http://") ||
    imgStr.startsWith("https://") ||
    imgStr.startsWith("/uploads/")
  ) {
    return [{ url: imgStr, default: true }];
  }

  if (imgStr.startsWith("data:image")) {
    try {
      let ext = "png";
      if (imgStr.startsWith("data:image/jpeg")) ext = "jpg";
      else if (imgStr.startsWith("data:image/jpg")) ext = "jpg";
      else if (imgStr.startsWith("data:image/webp")) ext = "webp";

      const base64Data = imgStr.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const filename = `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, buffer);

      const host = req.get("host") || `localhost:${process.env.PORT || 3000}`;
      const protocol = req.protocol || "http";
      const fileUrl = `${protocol}://${host}/uploads/${filename}`;
      return [{ url: fileUrl, default: true }];
    } catch (e) {
      console.error("Failed to write image buffer:", e);
      return [{ url: imgStr, default: true }];
    }
  }

  return [{ url: imgStr, default: true }];
}

async function assignKeycloakRoleAndGroup(
  kcAdmin: any,
  keycloakId: string,
  role: string,
) {
  if (!role) return;
  try {
    const groups = await kcAdmin.groups.find({ search: role });
    const targetGroup = groups.find((g: any) => g.name === role);
    if (targetGroup && targetGroup.id) {
      await kcAdmin.users.addToGroup({
        id: keycloakId,
        groupId: targetGroup.id,
      });
      console.log(`... Added Keycloak user to group: ${role}`);
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
    }
  } catch (roleErr: any) {
    console.error(
      `... Failed to assign realm role ${role} in Keycloak:`,
      roleErr.message || roleErr,
    );
  }
}

export async function handleGetUsers(req: Request, res: Response) {
  try {
    const users = await UserInfo.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Fetch Users Error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

export async function handleCreateUser(req: Request, res: Response) {
  return handleUserCreate(req, res);
}

export async function handleUpdateUser(req: Request, res: Response) {
  return handleUserEdit(req, res);
}

export async function handleUserCreate(req: Request, res: Response) {
  try {
    const {
      first_name,
      last_name,
      firstName,
      lastName,
      email,
      role = "manager_g",
      phone_code = "+91",
      phone_number,
      gender,
      dob,
      status = "Active",
      image,
      district,
      state,
      zipcode,
      password = "password@123",
      customer_id: providedCustomerId,
      keycloakId: providedKeycloakId,
    } = req.body;

    const first = (first_name || firstName || "").trim();
    const last = (last_name || lastName || "").trim();
    const userEmail = (email || "").trim().toLowerCase();

    if (!first) {
      return res.status(400).json({ error: "First name is required." });
    }
    if (!last) {
      return res.status(400).json({ error: "Last name is required." });
    }
    if (!userEmail) {
      return res.status(400).json({ error: "Email is required." });
    }

    const existing = await Customers.findOne({ email: userEmail });
    if (existing) {
      return res
        .status(400)
        .json({ error: "A user with this email already exists." });
    }

    let keycloakId = providedKeycloakId;
    const kcAdmin = await getMasterAdminClient();

    if (!keycloakId) {
      try {
        const kcUser = await kcAdmin.users.create({
          username: userEmail,
          email: userEmail,
          firstName: first,
          lastName: last,
          enabled: status !== "Inactive",
          emailVerified: true,
          credentials: [
            {
              type: "password",
              value: password || "password@123",
              temporary: false,
            },
          ],
        });
        keycloakId = kcUser.id;
        console.log("✅ Keycloak User created with ID:", keycloakId);
        await assignKeycloakRoleAndGroup(kcAdmin, keycloakId, role);
      } catch (kcErr: any) {
        console.error(
          "Keycloak user creation warning:",
          kcErr.response?.data || kcErr.message,
        );
        const existingKc = await kcAdmin.users.find({ email: userEmail });
        if (existingKc && existingKc.length > 0) {
          keycloakId = existingKc[0].id;
          await assignKeycloakRoleAndGroup(kcAdmin, keycloakId, role);
        } else {
          return res.status(400).json({
            error: `Failed to create Keycloak user: ${kcErr.response?.data?.errorMessage || kcErr.message}`,
          });
        }
      }
    }

    const processedImages = processSingleImage(image, req);
    const customer_id =
      providedCustomerId ||
      "uid_" +
        Date.now().toString(16) +
        Math.random().toString(16).substring(2, 8);

    const newCustomer = new Customers({
      customer_id,
      keycloakId,
      first_name: first,
      last_name: last,
      firstName: first,
      lastName: last,
      email: userEmail,
      role: role || "manager_g",
      phone_code,
      phone_number,
      gender,
      dob,
      status: status || "Active",
      approvalStatus: "Approved",
      public_verify: true,
      image: processedImages,
      district,
      state,
      zipcode,
      whoiam_register: "For myself",
      profile_created_for: "For myself",
      createdAtTime: new Date(),
      modifiedAtTime: new Date(),
    });

    await newCustomer.save();

    try {
      await UserInfo.findOneAndUpdate(
        { email: userEmail },
        {
          keycloakId,
          firstName: first,
          lastName: last,
          email: userEmail,
          role: role || "manager_g",
          status: status || "Active",
        },
        { upsert: true, new: true },
      );
    } catch (uiErr) {
      console.error("UserInfo sync warning:", uiErr);
    }

    return res.json({
      message: "User created successfully!",
      data: newCustomer,
    });
  } catch (err: any) {
    console.error("handleUserCreate error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Failed to create user." });
  }
}

export async function handleUserEdit(req: Request, res: Response) {
  try {
    const {
      id,
      _id,
      customer_id,
      keycloakId,
      email,
      first_name,
      last_name,
      firstName,
      lastName,
      role,
      phone_code,
      phone_number,
      gender,
      dob,
      status,
      image,
      district,
      state,
      zipcode,
    } = req.body;

    const targetId = id || _id;
    let query: any = {};
    if (targetId) query._id = targetId;
    else if (customer_id) query.customer_id = customer_id;
    else if (email) query.email = email;
    else if (keycloakId) query.keycloakId = keycloakId;
    else {
      return res.status(400).json({
        error: "Missing identifier (id, customer_id, or email) in request body",
      });
    }

    const currentUser = await Customers.findOne(query);
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const first = (
      first_name !== undefined
        ? first_name
        : firstName !== undefined
          ? firstName
          : currentUser.first_name || currentUser.firstName || ""
    ).trim();
    const last = (
      last_name !== undefined
        ? last_name
        : lastName !== undefined
          ? lastName
          : currentUser.last_name || currentUser.lastName || ""
    ).trim();
    const newEmail = email ? email.trim().toLowerCase() : currentUser.email;

    if (newEmail && newEmail !== currentUser.email) {
      const emailExists = await Customers.findOne({
        email: newEmail,
        _id: { $ne: currentUser._id },
      });
      if (emailExists) {
        return res
          .status(400)
          .json({ error: "A user with this email already exists." });
      }
    }

    const userKeycloakId = currentUser.keycloakId || keycloakId;
    if (userKeycloakId) {
      try {
        const kcAdmin = await getMasterAdminClient();
        await kcAdmin.users.update(
          { id: userKeycloakId },
          {
            firstName: first,
            lastName: last,
            email: newEmail,
            enabled: status !== "Inactive",
          },
        );
        const currentRole = (currentUser as any).role;
        if (role && role !== currentRole) {
          await assignKeycloakRoleAndGroup(kcAdmin, userKeycloakId, role);
        }
      } catch (kcErr: any) {
        console.error(
          "Keycloak user update warning:",
          kcErr.response?.data || kcErr.message,
        );
      }
    }

    const updateData: any = {
      first_name: first,
      last_name: last,
      firstName: first,
      lastName: last,
      email: newEmail,
      modifiedAtTime: new Date(),
    };

    if (role !== undefined) updateData.role = role;
    if (phone_code !== undefined) updateData.phone_code = phone_code;
    if (phone_number !== undefined) updateData.phone_number = phone_number;
    if (gender !== undefined) updateData.gender = gender;
    if (dob !== undefined) updateData.dob = dob;
    if (status !== undefined) updateData.status = status;
    if (district !== undefined) updateData.district = district;
    if (state !== undefined) updateData.state = state;
    if (zipcode !== undefined) updateData.zipcode = zipcode;

    if (image !== undefined) {
      updateData.image = processSingleImage(image, req);
    }

    const updated = await Customers.findOneAndUpdate(query, updateData, {
      new: true,
    });

    try {
      await UserInfo.findOneAndUpdate(
        { $or: [{ email: currentUser.email }, { keycloakId: userKeycloakId }] },
        {
          firstName: first,
          lastName: last,
          email: newEmail,
          role: role || (currentUser as any).role,
          status: status || (currentUser as any).status || "Active",
        },
        { new: true },
      );
    } catch (uiErr) {
      console.error("UserInfo sync warning:", uiErr);
    }

    return res.json({
      message: "User updated successfully!",
      data: updated,
    });
  } catch (err: any) {
    console.error("handleUserEdit error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Failed to update user." });
  }
}

export async function handleUserDelete(req: Request, res: Response) {
  try {
    const { id, _id, customer_id } = req.body;
    const targetId = id || _id;
    let query: any = {};
    if (targetId) query._id = targetId;
    else if (customer_id) query.customer_id = customer_id;
    else {
      return res
        .status(400)
        .json({ error: "Missing id or customer_id in request body" });
    }

    const userToDelete = await Customers.findOne(query);
    if (!userToDelete) {
      return res.status(404).json({ error: "User not found" });
    }

    if (userToDelete.keycloakId) {
      try {
        const kcAdmin = await getMasterAdminClient();
        await kcAdmin.users.del({ id: userToDelete.keycloakId });
      } catch (kcErr: any) {
        console.error(
          "Keycloak user deletion warning:",
          kcErr.response?.data || kcErr.message,
        );
      }
    }

    await Customers.deleteOne(query);
    if (userToDelete.email) {
      await UserInfo.deleteOne({ email: userToDelete.email }).catch(() => {});
    }

    return res.json({ message: "User deleted successfully!" });
  } catch (err: any) {
    console.error("handleUserDelete error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Failed to delete user." });
  }
}
