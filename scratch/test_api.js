const axios = require('axios');

async function testApi() {
  const TLOGS_API_KEY = "3d2fbb1bb6184d4b7ecc7c13e0dcd9eaSO9DkC2r38UpfvLGM57Btg6TWqhEs1lI";
  const TLOGS_BASE_URL = "https://tlogsmarketplace.com/api";
  
  try {
    const res = await axios.get(`${TLOGS_BASE_URL}/products.php?api_key=${TLOGS_API_KEY}`);
    console.log(JSON.stringify(res.data, null, 2));
  } catch (error) {
    console.error(error.message);
  }
}

testApi();
