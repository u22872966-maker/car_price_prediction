import React, { useState, useEffect, FormEvent } from 'react';
import { checkHealth, predict, type PredictionResponse } from '../lib/api';

interface HouseFormData {
  bedrooms: string;
  bathrooms: string;
  living_area: string;
  condition: string;
  schools: string;
}

interface FormErrors {
  bedrooms?: string;
  bathrooms?: string;
  living_area?: string;
  condition?: string;
  schools?: string;
}

const SAMPLE_DATA: HouseFormData = {
  bedrooms: '3',
  bathrooms: '2',
  living_area: '1800',
  condition: '3',
  schools: '2',
};

export default function HousePricePredictor() {
  const [formData, setFormData] = useState<HouseFormData>({
    bedrooms: '3',
    bathrooms: '2',
    living_area: '1200',
    condition: '3',
    schools: '2',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [apiError, setApiError] = useState<string>('');
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  // Check API health on component mount
  useEffect(() => {
    const checkApiHealth = async () => {
      const healthy = await checkHealth();
      setIsHealthy(healthy);
    };
    
    checkApiHealth();
  }, []);

  // Validation functions
  const validateField = (name: keyof HouseFormData, value: string): string | undefined => {
    const numValue = Number(value);
    
    if (value.trim() === '' || isNaN(numValue)) {
      return 'This field is required and must be a valid number';
    }

    switch (name) {
      case 'bedrooms':
        if (!Number.isInteger(numValue) || numValue < 0 || numValue > 20) {
          return 'Bedrooms must be an integer between 0 and 20';
        }
        break;
      case 'bathrooms':
        if (!Number.isInteger(numValue) || numValue < 0 || numValue > 20) {
          return 'Bathrooms must be an integer between 0 and 20';
        }
        break;
      case 'living_area':
        if (numValue < 0 || numValue > 100000) {
          return 'Living area must be between 0 and 100,000 sq ft';
        }
        break;
      case 'condition':
        if (!Number.isInteger(numValue) || numValue < 1 || numValue > 5) {
          return 'Condition must be an integer between 1 and 5';
        }
        break;
      case 'schools':
        if (!Number.isInteger(numValue) || numValue < 0 || numValue > 20) {
          return 'Schools must be an integer between 0 and 20';
        }
        break;
    }
    
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let hasErrors = false;

    Object.entries(formData).forEach(([key, value]) => {
              const error = validateField(key as keyof HouseFormData, value);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors for this field
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Clear API error and prediction when form changes
    if (apiError) setApiError('');
    if (prediction) setPrediction(null);
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setApiError('');
    setPrediction(null);

    try {
      const result = await predict(formData);
      setPrediction(result);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sample data fill
  const handleTrySample = () => {
    setFormData(SAMPLE_DATA);
    setErrors({});
    setApiError('');
    setPrediction(null);
  };

  // Handle Enter key submission
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e as any);
    }
  };

  // Format currency
  const formatCurrency = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            House Price Prediction
          </h1>
          <p className="text-lg text-gray-600">
            Get an estimated house price based on key property features
          </p>
        </div>

        {/* Health Status Banner */}
        {isHealthy === false && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  API offline or unreachable
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Unable to connect to the prediction service. Please check your connection or try again later.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Fields */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Bedrooms */}
              <div>
                <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <input
                  type="number"
                  id="bedrooms"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.bedrooms ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 3"
                  min="0"
                  max="20"
                  step="1"
                />
                {errors.bedrooms && (
                  <p className="mt-1 text-sm text-red-600">{errors.bedrooms}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Number of bedrooms (0-20)</p>
              </div>

              {/* Bathrooms */}
              <div>
                <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <input
                  type="number"
                  id="bathrooms"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.bathrooms ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 2"
                  min="0"
                  max="20"
                  step="1"
                />
                {errors.bathrooms && (
                  <p className="mt-1 text-sm text-red-600">{errors.bathrooms}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Number of bathrooms (0-20)</p>
              </div>

              {/* Living Area */}
              <div className="sm:col-span-2">
                <label htmlFor="living_area" className="block text-sm font-medium text-gray-700 mb-2">
                  Living Area (sq ft)
                </label>
                <input
                  type="number"
                  id="living_area"
                  name="living_area"
                  value={formData.living_area}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.living_area ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 1200"
                  min="0"
                  max="100000"
                  step="0.1"
                />
                {errors.living_area && (
                  <p className="mt-1 text-sm text-red-600">{errors.living_area}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Total living area in square feet (0-100,000)</p>
              </div>

              {/* Condition */}
              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <input
                  type="number"
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.condition ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 3"
                  min="1"
                  max="5"
                  step="1"
                />
                {errors.condition && (
                  <p className="mt-1 text-sm text-red-600">{errors.condition}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Property condition (1-5, where 5 is excellent)</p>
              </div>

              {/* Schools */}
              <div>
                <label htmlFor="schools" className="block text-sm font-medium text-gray-700 mb-2">
                  Schools
                </label>
                <input
                  type="number"
                  id="schools"
                  name="schools"
                  value={formData.schools}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.schools ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 2"
                  min="0"
                  max="20"
                  step="1"
                />
                {errors.schools && (
                  <p className="mt-1 text-sm text-red-600">{errors.schools}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Number of nearby schools (0-20)</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Predicting...
                  </span>
                ) : (
                  'Predict Price'
                )}
              </button>
              
              <button
                type="button"
                onClick={handleTrySample}
                disabled={isLoading}
                className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Try Sample
              </button>
            </div>
          </form>

          {/* Error Display */}
          {apiError && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Prediction Error
                  </h3>
                  <p className="text-sm text-red-700 mt-1">{apiError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results Display */}
          {prediction && (
            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-md">
              <div className="text-center">
                <h3 className="text-lg font-medium text-green-800 mb-2">
                  Predicted House Price
                </h3>
                <div className="text-4xl font-bold text-green-900">
                  {formatCurrency(prediction.price, prediction.currency)}
                </div>
                <p className="text-sm text-green-700 mt-2">
                  Based on the provided property features
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            This prediction is based on machine learning models and should be used for informational purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}