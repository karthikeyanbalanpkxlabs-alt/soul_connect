import re

path = '/Users/karthikeyanbalan/DEVELOPMENT/soul_connect_project/soul_connect/SoulConnect_FRONT_END_Next/src/app/portal/customer/usePortalCustomerPage.ts'
with open(path, 'r') as f:
    content = f.read()

pattern = re.compile(r'  const onHandleClickCreateCustomer = \(\) => \{.*?(?=  const onHandleClickCreateManager = \(\) => \{)', re.DOTALL)

replacement = """  const onHandleClickCreateCustomer = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const onHandleEditCustomer = (customer: any) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const onSaveCustomer = (formData: any) => {
    const token = keycloak?.token;
    const isEdit = !!editingCustomer;
    const endpoint = isEdit ? "http://localhost:3000/api/customer_update" : "http://localhost:3000/api/customer_create";
    
    if (!isEdit) {
      let dataGenerateId = generateId();
      formData.customer_id = formData.customer_id || "cid_" + dataGenerateId;
      formData.keycloakId = formData.keycloakId || dataGenerateId;
    }

    fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((r) => r.json())
      .then((data) => {
        console.log(isEdit ? "customer_update response:" : "customer_create response:", data);
        setIsModalOpen(false);
        loadCustomers();
      })
      .catch((e) => console.error("Error saving customer:", e));
  };

"""
content = pattern.sub(replacement, content)

col_target = """    {
      key: "subscription_type",
      label: "Subscription Type",
      isFilterable: true,
    },"""

col_repl = """    {
      key: "subscription_type",
      label: "Subscription Type",
      isFilterable: true,
    },
    {
      key: "action",
      label: "Action",
      isFilterable: false,
      render: (row: any) => (
        <button
          onClick={() => onHandleEditCustomer(row)}
          className="text-violet-600 hover:text-violet-800 font-medium"
        >
          Edit
        </button>
      ),
    },"""

content = content.replace(col_target, col_repl)

with open(path, 'w') as f:
    f.write(content)
