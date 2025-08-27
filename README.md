# House Price Predictor

A responsive React web application that predicts house prices using a FastAPI machine learning model. Built with Vite, TypeScript, and Tailwind CSS.

## Features

- **Responsive Design**: Works seamlessly on mobile and desktop devices
- **Real-time Validation**: Client-side form validation with helpful error messages
- **API Health Monitoring**: Displays connection status to the prediction service
- **Environment Configuration**: Easy configuration for different environments
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Accessibility**: Built with accessibility best practices
- **Performance**: Optimized for fast loading and smooth interactions

## Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- A running FastAPI backend service (see API Requirements below)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your API settings:

```bash
cp .env.example .env
```

Edit the `.env` file to match your FastAPI server configuration:

```bash
# Required: Base URL of your FastAPI server
VITE_API_BASE=http://127.0.0.1:8000

# Optional: API key for authentication (if required by your server)
# VITE_API_KEY=YOUR_API_KEY_HERE
```

**Environment Variables:**

- `VITE_API_BASE`: The base URL of your FastAPI server (defaults to `http://127.0.0.1:8000`)
- `VITE_API_KEY`: Optional API key sent as `x-api-key` header if provided

### 3. Development Server

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Production Build

Build the application for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## API Requirements

This application expects a FastAPI backend with the following endpoints:

### Health Check
- **GET** `/health`
- **Response**: `{ "status": "ok" }`

### Price Prediction
- **POST** `/predict`
- **Headers**: 
  - `Content-Type: application/json`
  - `x-api-key: <API_KEY>` (optional, if `VITE_API_KEY` is set)
- **Request Body**:
  ```json
  {
    "bedrooms": 3,
    "bathrooms": 2,
    "living_area": 1800.0,
    "condition": 3,
    "schools": 2
  }
  ```
- **Response**:
  ```json
  {
    "price": 450000.0,
    "currency": "USD"
  }
  ```

### Field Specifications

- `bedrooms`: Integer (0-20) - Number of bedrooms
- `bathrooms`: Integer (0-20) - Number of bathrooms  
- `living_area`: Float (0-100000) - Living area in square feet
- `condition`: Integer (1-5) - Property condition rating
- `schools`: Integer (0-20) - Number of nearby schools

## Important Notes

### Server-Side Warnings

Your FastAPI server may log sklearn warnings like:
```
UserWarning: X does not have valid feature names, but RandomForestRegressor was fitted with feature names
```

**This warning is harmless and occurs on the server side.** The client application:
- Sends the exact JSON field names required by the model
- Handles responses based on HTTP status codes and JSON structure
- Should ignore server-side warnings and focus on the API response

### Feature Names

The API request must use **exactly** these field names to avoid server-side warnings:
- `bedrooms` (not `bedroom_count`)
- `bathrooms` (not `bathroom_count`) 
- `living_area` (not `living_space` or `sqft`)
- `condition` (not `property_condition`)
- `schools` (not `school_count`)

## Usage

1. **Form Input**: Enter property details in the form fields
2. **Validation**: The form validates inputs in real-time
3. **Sample Data**: Click "Try Sample" to populate with example values
4. **Prediction**: Click "Predict Price" to get an estimated house price
5. **Results**: View the formatted price prediction with currency

### Form Fields

- **Bedrooms**: Number of bedrooms (0-20)
- **Bathrooms**: Number of bathrooms (0-20)
- **Living Area**: Total living area in square feet (0-100,000)
- **Condition**: Property condition rating (1-5, where 5 is excellent)
- **Schools**: Number of nearby schools (0-20)

## Error Handling

The application handles various error scenarios:

- **Validation Errors**: Real-time field validation with helpful messages
- **Network Errors**: Connection issues and timeouts (15-second timeout)
- **API Errors**: HTTP error responses with status codes
- **Health Check**: Displays banner when API is unreachable

## Development Features

When running in development mode (`npm run dev`), the application:
- Logs API requests and responses to the browser console
- Provides detailed error information
- Shows additional debugging information

In production builds, logging is disabled for better performance.

## Browser Support

- Chrome/Chromium 88+
- Firefox 84+
- Safari 14+
- Edge 88+

## Architecture

```
src/
├── lib/
│   └── api.ts          # API client with health check and prediction
├── pages/
│   └── HousePricePredictor.tsx  # Main page component
├── App.tsx             # Router and app shell
├── main.tsx            # Application bootstrap
└── index.css           # Tailwind CSS and global styles
```

## Deployment

### Environment-Specific Builds

For different environments, update the `.env` file before building:

**Development/Local:**
```bash
VITE_API_BASE=http://127.0.0.1:8000
```

**Staging:**
```bash
VITE_API_BASE=https://api-staging.yourdomain.com
VITE_API_KEY=staging_api_key
```

**Production:**
```bash
VITE_API_BASE=https://api.yourdomain.com
VITE_API_KEY=production_api_key
```

### Static Hosting

The built application is a static site that can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Any static hosting service

## Troubleshooting

### API Connection Issues

1. **Check API Health**: The app displays a banner if the API is unreachable
2. **Verify Environment Variables**: Ensure `VITE_API_BASE` points to your running API
3. **CORS Issues**: Make sure your FastAPI server allows requests from your frontend domain
4. **Network Connectivity**: Test the API endpoints manually using curl or a REST client

### Common Solutions

- **API Offline**: Ensure your FastAPI server is running and accessible
- **Wrong Port**: Verify the port in `VITE_API_BASE` matches your API server
- **Firewall Issues**: Check if local firewall is blocking connections
- **Build Issues**: Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`

## License

This project is provided as-is for demonstration purposes.