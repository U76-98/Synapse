import axios from "axios";

const ML_URL = process.env.ML_URL || "http://localhost:5000/predict";

/**
 * Calls the Flask ML API to get productivity predictions
 * @param {Object} payload - Employee metrics (Claimed_Hours, Active_Hours, etc.)
 * @returns {Promise<{ok: boolean, data?: any, error?: string}>}
 */
export async function predictProductivity(payload) {
  try {
    const res = await axios.post(ML_URL, payload, { 
      timeout: 5000,
      headers: { "Content-Type": "application/json" }
    });
    return { ok: true, data: res.data };
  } catch (err) {
    const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
    const errorDetails = {
      message: errorMessage,
      status: err.response?.status,
      data: err.response?.data
    };
    console.error(`ML API Error:`, errorDetails);
    return { ok: false, error: errorMessage };
  }
}


