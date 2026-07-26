import { Request, Response } from "express";
import { UserInfo } from "../models/userInfo";
import { getMasterAdminClient } from "../config/keycloak-admin";

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
  const { firstName, lastName, email, role, status } = req.body;
  console.log("🚀 Attempting to create user:", email);
  try {
    const kcAdminClient = await getMasterAdminClient();

    const kcUser = await kcAdminClient.users.create({
      username: firstName,
      email,
      firstName,
      lastName,
      enabled: true,
      emailVerified: true,
      credentials: [
        {
          type: "password",
          value: "password@123",
          temporary: false,
        },
      ],
    });

    const keycloakId = kcUser.id;
    console.log("✅ User created in Keycloak, ID:", keycloakId);

    const newUser = new UserInfo({
      keycloakId,
      firstName,
      lastName,
      email,
      role,
      status,
    });
    await newUser.save();
    console.log("✅ User saved in MongoDB");

    res.json(newUser);
  } catch (err: any) {
    console.error("❌ Create User Error Details:");
    if (err.response) {
      console.error("Keycloak Status Code:", err.response.status);
      console.error("Keycloak Error Message:", err.response.data);
    } else {
      console.error("Error Message:", err.message);
    }

    const message =
      err.response?.data?.errorMessage ||
      err.message ||
      "Failed to create user";
    res.status(500).json({ error: message });
  }
}

export async function handleUpdateUser(req: Request, res: Response) {
  const { firstName, lastName, email, role, status } = req.body;

  try {
    const user = await UserInfo.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found in DB" });
    }

    const kcAdminClient = await getMasterAdminClient();
    let keycloakId = user.keycloakId;

    if (!keycloakId) {
      const kcUsers = await kcAdminClient.users.find({ email });

      if (!kcUsers.length) {
        return res.status(404).json({ error: "User not found in Keycloak" });
      }

      keycloakId = kcUsers[0].id;
      user.keycloakId = keycloakId;
      await user.save();
    }

    await kcAdminClient.users.update(
      { id: keycloakId as string },
      {
        firstName,
        lastName,
        email,
        enabled: status === "Active",
      },
    );

    const updatedUser = await UserInfo.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email, role, status },
      { new: true },
    );

    return res.json(updatedUser);
  } catch (err: any) {
    console.error("Update User Error:", err.response?.data || err.message);
    return res.status(err.response?.status || 500).json({
      error: err.response?.data || "Failed to update user",
    });
  }
}
