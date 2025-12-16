export interface PredictionInput {
  "PM2.5": number;
  "PM10": number;
  "SO2": number;
  "O3": number;
  "NO2": number;
  "CO": number;
}

export async function predictAQI(input: PredictionInput): Promise<number> {
  try {
    // Map input to API expected format (flat structure, PM2_5 with underscore)
    const apiPayload = {
      "PM2_5": input["PM2.5"],
      "PM10": input["PM10"],
      "SO2": input["SO2"],
      "O3": input["O3"],
      "NO2": input["NO2"],
      "CO": input["CO"]
    };

    const response = await fetch('https://aqi-api-rfpk.onrender.com/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiPayload), // API expects flat structure
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Prediction API Response:", data);

    // API returns { "predicted_aqi": number, "input_data": object }
    if (typeof data.predicted_aqi === 'number') {
      return Math.round(data.predicted_aqi);
    }

    // Fallback parsing just in case
    if (typeof data === 'number') {
      return Math.round(data);
    }
    if (data.prediction !== undefined) {
      if (Array.isArray(data.prediction)) {
        return Math.round(Number(data.prediction[0]));
      }
      return Math.round(Number(data.prediction));
    }

    console.error("Unknown response format:", data);
    throw new Error("Unknown response format");

  } catch (error) {
    console.error("Failed to predict AQI:", error);
    throw error;
  }
}
