const axios = require('axios');

async function test() {
  const TLOGS_API_KEY = "3d2fbb1bb6184d4b7ecc7c13e0dcd9eaSO9DkC2r38UpfvLGM57Btg6TWqhEs1lI";
  const TLOGS_BASE_URL = "https://tlogsmarketplace.com/api";
  
  console.log("Testing TLogs API...");
  try {
    const response = await axios.get(`${TLOGS_BASE_URL}/products.php?api_key=${TLOGS_API_KEY}`, { timeout: 5000 });
    console.log("API Response Status:", response.status);
    console.log("Categories count:", response.data.categories ? response.data.categories.length : "N/A");
  } catch (err) {
    console.error("API Call failed!", err.message);
    if (err.response) {
      console.log("Response data:", err.response.data);
    }
  }
}

test();
