import axios from "axios";

// Expected fields for validation
const REQUIRED_FIELDS = [
  "Claimed_Hours", "Active_Hours", "Claimed_Minus_Active", "Utilization_Rate",
  "Commits", "PRs_Opened", "Tasks_Done", "Performance_Score", "Meetings_Hours",
  "Recent_HR_Flag", "Project_Type", "Role_Level", "Team_ID"
];

/**
 * Validates the input data against required fields and types
 */
const validateInput = (data) => {
  const errors = [];
  const validatedData = {};

  // Check for missing fields
  const missingFields = REQUIRED_FIELDS.filter(field => !(field in data));
  if (missingFields.length > 0) {
    errors.push(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Validate field types
  REQUIRED_FIELDS.forEach(field => {
    if (data[field] !== undefined) {
      const value = data[field];
      // Convert to number if it's a string representation of a number
      validatedData[field] = typeof value === 'string' && !isNaN(value) ? 
        parseFloat(value) : value;
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    data: validatedData
  };
};

/**
 * Handles prediction requests from frontend and forwards them to the Flask AI model API
 */
export const getPrediction = async (req, res) => {
  const startTime = process.hrtime();
  
  try {
    // Validate input
    const { isValid, errors, data: validatedData } = validateInput(req.body);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
        errors
      });
    }

    // Add timestamp to the request
    const requestData = {
      ...validatedData,
      request_timestamp: new Date().toISOString()
    };

    console.log(`[${new Date().toISOString()}] Making prediction request:`, requestData);
    
    // POST data to Flask model API
    const response = await axios.post("http://127.0.0.1:5000/predict", requestData, {
      timeout: 5000,
      headers: { 
        "Content-Type": "application/json",
        "X-Request-ID": req.id || `req-${Date.now()}`
      },
    });

    // Calculate response time
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const responseTimeMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);

    console.log(`[${new Date().toISOString()}] Prediction successful in ${responseTimeMs}ms`);
    
    // Send response back to frontend
    res.json({
      success: true,
      requestId: req.id,
      responseTimeMs,
      data: response.data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Prediction Error:`, error.message);
    
    const statusCode = error.response?.status || 500;
    const errorDetails = error.response?.data || { message: error.message };
    
    res.status(statusCode).json({
      success: false,
      error: "Failed to get prediction",
      details: errorDetails,
      timestamp: new Date().toISOString()
    });
  }
};
