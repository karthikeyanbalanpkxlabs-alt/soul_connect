const payload = {
  customer_id: "cid_19f42ddba09fdf09082",
  first_name: "karthikeyan19f42ddba09fdf09082",
  last_name: "Jobalanhn19f42ddba09fdf09082",
  email: "karthikeyanbalan.19f42ddba09fdf09082@gmail.com",
  role: "manager_g",
  dob: "02-12-1999",
  gender: "maile",
  phone_number: "8870688606",
  phone_code: "+91",
  district: "coimbatore",
  taluk_town: "r.spuram",
  state: "tamilnadu",
  zipcode: "641001",
  religion: "hindhu",
  caste: "bc",
  mother_tongue: "tamil",
  maritial_status: "unmarried",
  education: "ba",
  profession: "employee",
  annual_income: "10000",
  height: "5.2",
  about_self: "NA",
  partner_preference: "NA",
  subscription_type: "guest",
  subscription_view_access: 4,
  image: [
    {
      url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      default: false,
    },
  ],
  video: "",
};

fetch("http://localhost:3000/api/public/customer_edit", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
})
  .then((r) => r.json())
  .then(console.log)
  .catch(console.error);
