const nodemailer = require("nodemailer");
// import KcAdminClient from '@keycloak/keycloak-admin-client'

// console.log("USER:", process.env.GMAIL_USER);
// console.log("PASS:", process.env.GMAIL_PASS?.length);

// const transporter = nodemailer.createTransport({
//   // secure: true,
//   // host: 'smtp.gmail.com',
//   // port: 465,
//   service: "gmail",
//   auth: {
//     user: process.env.GMAIL_USER || "karthikeyanbalan.pklabs@gmail.com",
//     pass: process.env.GMAIL_PASS || "qizzdwxyqgvdykrv",
//   },
// });

// transporter
//   .verify()
//   .then(() => console.log("Email Connected"))
//   .catch((err: any) => console.error("Email Connection error :", err?.message));

// app.post("/api/send-email-gmail", async (req, res) => {
//   const { to, subject, message } = req.body;

//   try {
//     console.log(to, subject, message);
//     await transporter.sendMail({
//       // from: process.env.GMAIL_USER || 'karthikeyanbalan.pklabs@gmail.com',
//       to,
//       subject,
//       html: `<h1>${message}</h1>`,
//     });

//     res.status(200).json({
//       success: true,
//       message: "Email sent successfully",
//     });
//   } catch (error: any) {
//     res.status(500).json({
//       success: false,
//       error: error?.message,
//     });
//   }
// });

// GET /api/customer_list for frontend compatibility (protected by keycloak)
// app.get(
//   "/api/customer_list",
//   keycloak.protect(),
//   async (req: Request, res: Response) => {
//     const token = (req as any).kauth?.grant?.access_token?.content;
//     const keycloakId = token?.sub;

//     if (!keycloakId) {
//       console.warn("⚠️ GET /api/customer_list - No keycloakId found in token!");
//       return res.status(401).json({ error: "Unauthorized" });
//     }

//     console.log(`📡 GET /api/customer_list requested.`);
//     console.log(`🔑 Decoded Keycloak Token:`, JSON.stringify(token, null, 2));

//     try {
//       const email = token?.email;
//       let customer = await Customers.findOne({ keycloakId });

//       if (customer) {
//         console.log(`✅ Customer found by keycloakId: ${keycloakId}`);
//       } else {
//         console.log(
//           `🔍 Customer not found by keycloakId. Searching by email: [${email}]...`,
//         );
//         if (email) {
//           customer = await Customers.findOne({ email });
//           if (customer) {
//             console.log(
//               `✅ Customer found by email. Linking keycloakId: ${keycloakId}`,
//             );
//             await Customers.updateOne(
//               { _id: customer._id },
//               { $set: { keycloakId } },
//             );
//             customer.keycloakId = keycloakId;
//           } else {
//             console.log(
//               `❌ Customer not found by email: [${email}] in database.`,
//             );
//             const dbEmails = await Customers.find({}, "email").limit(10);
//             console.log(
//               `📋 Existing customer emails in DB (up to 10):`,
//               dbEmails.map((c) => c.email),
//             );
//           }
//         } else {
//           console.warn("⚠️ Token email field is undefined!");
//         }
//       }

//       if (customer) {
//         res.json(customer);
//       } else {
//         res.json(null);
//       }
//     } catch (err) {
//       console.error("MongoDB Fetch Error:", err);
//       res.status(500).json({ error: "Database error during fetch" });
//     }
//   },
// );
