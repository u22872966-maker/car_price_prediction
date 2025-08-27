const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';
const API_KEY = import.meta.env.VITE_API_KEY || '';

export interface PredictionRequest {
  bedrooms: number;
  bathrooms: number;
  living_area: number;
  condition: number;
  schools: number;
}

export interface PredictionResponse {
  price: number;
  currency: string;
}

export interface HealthResponse {
  status: string;
}

/**
 * Check if the API is healthy and reachable
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout for health check

    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return false;
    }

    const data: HealthResponse = await response.json();
    return data.status === 'ok';
  } catch (error) {
    // Log in development only
    if (import.meta.env.DEV) {
      console.warn('Health check failed:', error);
    }
    return false;
  }
}

/**
 * Convert form values to properly typed prediction request
 */
function validateAndConvertForm(form: Record<string, any>): PredictionRequest {
  const bedrooms = Number(form.bedrooms);
  const bathrooms = Number(form.bathrooms);
  const living_area = Number(form.living_area);
  const condition = Number(form.condition);
  const schools = Number(form.schools);

  // Check for NaN values
  if (isNaN(bedrooms) || isNaN(bathrooms) || isNaN(living_area) || isNaN(condition) || isNaN(schools)) {
    throw new Error('All form fields must be valid numbers');
  }

  return {
    bedrooms: Math.floor(bedrooms), // Ensure integers
    bathrooms: Math.floor(bathrooms),
    living_area: living_area, // Keep as float
    condition: Math.floor(condition),
    schools: Math.floor(schools),
  };
}

/**
 * Predict house price using the FastAPI model
 */
export async function predict(form: Record<string, any>): Promise<PredictionResponse> {
  // Validate and convert form data
  const requestData = validateAndConvertForm(form);

  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add API key if provided
  if (API_KEY) {
    headers['x-api-key'] = API_KEY;
  }

  // Set up timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    // Log request in development
    if (import.meta.env.DEV) {
      console.log('API Request:', {
        url: `${API_BASE}/predict`,
        method: 'POST',
        headers,
        body: requestData,
      });
    }

    const response = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle non-2xx responses
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Prediction failed (HTTP ${response.status}): ${errorText}`);
    }

    const data = await response.json();

    // Log response in development
    if (import.meta.env.DEV) {
      console.log('API Response:', data);
    }

    // Validate response structure
    if (typeof data.price !== 'number' || typeof data.currency !== 'string') {
      throw new Error('Invalid response format: missing or invalid price/currency fields');
    }

    return {
      price: data.price,
      currency: data.currency,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out after 15 seconds. Please try again.');
      }
      throw error;
    }
    
    throw new Error('An unexpected error occurred during prediction');
  }
}