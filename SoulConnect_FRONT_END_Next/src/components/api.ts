
import configUrls from "../../configUrls";

/**
 * @SAVE_CUSTOMER_DATA
 * @param Data 
 */
export const onSaveCustomer = async (data: any) => {
    let endpoint = configUrls?.apiUrl + "/api/customer_create";
    fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: ``,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((r) => r.json())
      .then((data) => {
        console.log("Customer created outside",data ) 
        return data       
      })
      .catch((e) => {
          console.error("Error saving customer:", e)
          return e
        });
  };