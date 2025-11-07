# Synapse - Employee Productivity Prediction System

A full-stack application for monitoring and predicting employee productivity using machine learning.

## System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Frontend      │◄───►│   Backend       │◄───►│   AI Model      │
│   (Next.js)     │     │   (Node.js)     │     │   (Flask)       │
│   Port: 3000    │     │   Port: 3001    │     │   Port: 5000    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Prerequisites

- Node.js (v16+)
- Python (3.8+)
- npm (v8+)
- pip (Python package manager)

## Getting Started

### 1. Start the AI Model Service

```bash
cd ai_model/model_training
pip install -r requirements.txt  # Install Python dependencies
python app.py
```

The AI service will start on http://localhost:5000

### 2. Start the Backend API

Open a new terminal:

```bash
cd backend
npm install
npm run dev
```

The backend API will start on http://localhost:3001

### 3. Start the Frontend

Open another terminal:

```bash
cd frontend/codenova
npm install
npm run dev
```

The frontend will be available at http://localhost:3000

## API Endpoints

### Backend API (http://localhost:3001)
- `GET /api/health` - Health check
- `GET /api/employees` - Get employee list
- `POST /api/predict` - Get productivity prediction

### AI Model API (http://localhost:5000)
- `GET /` - API status
- `POST /predict` - Get prediction from AI model

## Testing the System

You can test the complete system using the test script:

```bash
python ai_model/model_training/test_prediction.py
```

This will test both the direct AI model and the backend API.

## Troubleshooting

1. **Port Conflicts**:
   - Ensure ports 3000, 3001, and 5000 are not in use
   - Check for other services that might be using these ports

2. **AI Model Not Loading**:
   - Check if `employee_productivity_model.pkl` exists in the `ai_model/model_training` directory
   - The system will fall back to a dummy model if the file is not found

3. **CORS Issues**:
   - Ensure CORS is properly configured in both the backend and AI service
   - Check browser console for CORS-related errors

4. **Dependency Issues**:
   - Run `npm install` in both `backend` and `frontend/codenova` directories
   - Run `pip install -r requirements.txt` in the `ai_model/model_training` directory

## Environment Variables

### Backend (.env)
```
PORT=3001
NODE_ENV=development
ML_API_URL=http://localhost:5000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_ML_API_URL=http://localhost:5000
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
