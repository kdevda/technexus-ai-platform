const axios = require("axios");

async function testApi() {
  console.log("=== API TEST SCRIPT ===");
  
  // Test the test endpoint
  try {
    console.log("\n1. Testing /api/organizations/test endpoint...");
    const testResponse = await axios.get("http://localhost:3001/api/organizations/test");
    console.log("✅ Test endpoint successful!");
    console.log("Response:", JSON.stringify(testResponse.data, null, 2));
  } catch (error) {
    console.error("❌ Test endpoint failed:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
  }
  
  // Test the regular endpoint
  try {
    console.log("\n2. Testing /api/organizations endpoint...");
    // Note: This will likely fail without authentication
    const orgsResponse = await axios.get("http://localhost:3001/api/organizations");
    console.log("✅ Organizations endpoint successful!");
    console.log("Response:", JSON.stringify(orgsResponse.data, null, 2));
  } catch (error) {
    console.error("❌ Organizations endpoint failed:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    
    console.log("\n🔍 This is expected if authentication is required.");
    console.log("The client app handles authentication automatically.");
  }
  
  // Test the health endpoint
  try {
    console.log("\n3. Testing /api/health endpoint...");
    const healthResponse = await axios.get("http://localhost:3001/api/health");
    console.log("✅ Health endpoint successful!");
    console.log("Response:", JSON.stringify(healthResponse.data, null, 2));
  } catch (error) {
    console.error("❌ Health endpoint failed:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
  }
  
  console.log("\n=== TEST COMPLETE ===");
}

testApi();
