# NASA Healthy Cities - Setup Guide
## Data Pathways to Healthy Cities and Human Settlement

### 🌍 Project Overview
This comprehensive guide will help you set up and deploy the NASA Healthy Cities application for the NASA Space Apps Challenge. The application demonstrates how urban planners can use NASA Earth observation data to develop smart strategies for sustainable city growth.

## 📋 Prerequisites

### System Requirements
- **Node.js**: v16.0.0 or higher
- **npm**: v8.0.0 or higher  
- **Git**: Latest version
- **Python**: v3.8+ (for data processing scripts)
- **MongoDB**: v5.0+ (optional, for persistent storage)

### NASA Data Access (Optional)
- NASA Earthdata account: https://earthdata.nasa.gov/
- LP DAAC account: https://lpdaac.usgs.gov/
- NASA API keys (if available)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-team/nasa-healthy-cities.git
cd nasa-healthy-cities
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env file with your configuration
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
npm start
```

### 4. Data Processing (Optional)
```bash
cd ../data-processing
pip install -r requirements.txt
python setup_data.py
```

## 📊 NASA Data Sources Integration

### Current Integration Status
- ✅ **NASA POWER API**: Temperature and precipitation data
- ✅ **Mock Data**: Realistic synthetic data for demo
- 🔄 **LP DAAC**: MODIS/VIIRS data (integration ready)
- 🔄 **GPM IMERG**: High-resolution precipitation (integration ready)
- 🔄 **TEMPO**: Air quality for North America (integration ready)

### Data Sources Used
1. **GPM IMERG**: Precipitation data for flood risk assessment
   - URL: https://gpm.nasa.gov/data/imerg
   - Resolution: 0.1° x 0.1°, 30-minute intervals

2. **MODIS/VIIRS LST**: Land Surface Temperature for heat mapping
   - URL: https://lpdaac.usgs.gov/
   - Resolution: 1km, daily observations

3. **MODIS NDVI**: Vegetation indices for green space analysis
   - URL: https://lpdaac.usgs.gov/
   - Resolution: 250m, 16-day composites

4. **SRTM**: Elevation data for flood zone mapping
   - URL: https://lpdaac.usgs.gov/product_search/?keyword=SRTM
   - Resolution: 30m global coverage

5. **TEMPO**: Air quality measurements (North America)
   - URL: https://tempo.si.edu/
   - Resolution: 2km x 2km, hourly observations

## ⚙️ Configuration

### Environment Variables
Create a `.env` file in the server directory:

```bash
# Essential Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# NASA API Keys (Optional)
NASA_API_KEY=your_nasa_api_key
EARTHDATA_USERNAME=your_username
EARTHDATA_PASSWORD=your_password

# Enable Mock Data for Demo
MOCK_NASA_DATA=true
DEBUG=true
```

### Database Configuration (Optional)
For persistent storage, set up MongoDB:

```bash
# Install MongoDB
# Windows: Download from https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Ubuntu: sudo apt-get install mongodb

# Start MongoDB
mongod

# Add to .env
MONGODB_URI=mongodb://localhost:27017/nasa-healthy-cities
```

## 🏗️ Architecture Overview

### Frontend (React)
```
client/
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/             # Main application pages
│   ├── context/           # State management
│   ├── services/          # API communication
│   └── utils/             # Helper functions
└── public/                # Static assets
```

### Backend (Express)
```
server/
├── controllers/           # Request handlers
├── services/             # Business logic
├── middleware/           # Request processing
├── routes/               # API endpoints
├── utils/                # Utilities and helpers
└── logs/                 # Application logs
```

### Key Features Implemented
- 🌡️ **Temperature Monitoring**: MODIS/VIIRS Land Surface Temperature
- 🌧️ **Flood Risk Assessment**: GPM IMERG + SRTM elevation data
- 🌿 **Green Space Analysis**: NDVI vegetation indices
- 💨 **Air Quality Tracking**: TEMPO data for North America
- 🎯 **Risk Assessment**: Composite environmental risk calculation
- 🏗️ **Intervention Planning**: Nature-based solution simulator
- 💰 **Cost-Benefit Analysis**: Economic impact assessment

## 🌐 API Endpoints

### NASA Data Endpoints
- `GET /api/nasa/temperature?lat=23.8103&lon=90.4125`
- `GET /api/nasa/precipitation?lat=23.8103&lon=90.4125`
- `GET /api/nasa/vegetation?lat=23.8103&lon=90.4125`
- `GET /api/nasa/elevation?lat=23.8103&lon=90.4125`
- `GET /api/nasa/air-quality?lat=23.8103&lon=90.4125`
- `GET /api/nasa/risk-indices?lat=23.8103&lon=90.4125`

### Intervention Planning
- `GET /api/interventions/types`
- `POST /api/interventions/calculate`
- `POST /api/interventions/optimize`

### Analysis Tools
- `POST /api/analysis/cost-benefit`
- `POST /api/analysis/risk-assessment`
- `POST /api/analysis/policy-brief`

## 🎯 Demo Scenarios

### 1. Dhaka, Bangladesh (Default)
**Coordinates**: 23.8103°N, 90.4125°E
**Challenges**: High flood risk, urban heat island, air quality
**Recommended Interventions**: Urban wetlands, tree planting, permeable surfaces

### 2. New York City, USA
**Coordinates**: 40.7128°N, 74.0060°W
**Challenges**: Urban heat, air quality
**Recommended Interventions**: Cool roofs, green corridors, vertical gardens

### 3. London, UK
**Coordinates**: 51.5074°N, 0.1278°W
**Challenges**: Urban runoff, temperature regulation
**Recommended Interventions**: Green infrastructure, sustainable drainage

## 📈 Performance Optimization

### Caching Strategy
- **NASA Data**: Cached for 2 hours (frequently changing)
- **Risk Calculations**: Cached for 30 minutes
- **Intervention Results**: Cached for 1 hour

### Rate Limiting
- **General API**: 100 requests per 15 minutes per IP
- **NASA API**: 10 requests per minute per IP

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test

# Integration tests
npm run test:integration
```

### Load Testing
```bash
# Install Artillery
npm install -g artillery

# Run load tests
artillery run tests/load-test.yml
```

## 🚀 Deployment

### Development Deployment
```bash
# Start both frontend and backend
npm run dev:full

# Or separately
npm run dev:server  # Backend only
npm run dev:client  # Frontend only
```

### Production Deployment

#### Using Docker
```bash
# Build and run with Docker Compose
docker-compose up --build

# Or manually
docker build -t nasa-healthy-cities .
docker run -p 5000:5000 nasa-healthy-cities
```

#### Using PM2 (Process Manager)
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# Monitor
pm2 monit
```

#### Cloud Deployment (Heroku Example)
```bash
# Install Heroku CLI
# Create Heroku app
heroku create nasa-healthy-cities

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set NASA_API_KEY=your_key

# Deploy
git push heroku main
```

## 🔧 Troubleshooting

### Common Issues

#### 1. NASA API Rate Limits
**Problem**: Too many API requests
**Solution**: Enable caching and reduce request frequency
```bash
# In .env
MOCK_NASA_DATA=true  # Use mock data for development
```

#### 2. CORS Issues
**Problem**: Frontend can't connect to backend
**Solution**: Check CORS configuration
```javascript
// server.js
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000'
}));
```

#### 3. Memory Issues
**Problem**: High memory usage
**Solution**: Optimize caching and data processing
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 server.js
```

#### 4. Database Connection
**Problem**: MongoDB connection failed
**Solution**: Check MongoDB service
```bash
# Start MongoDB
sudo systemctl start mongod

# Check status
sudo systemctl status mongod
```

## 📋 Development Workflow

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-intervention-type

# Make changes and commit
git add .
git commit -m "Add new intervention type: Solar Panels"

# Push and create PR
git push origin feature/new-intervention-type
```

### Code Quality
```bash
# Linting
npm run lint

# Formatting
npm run format

# Type checking (if using TypeScript)
npm run type-check
```

## 📚 Additional Resources

### NASA APIs and Documentation
- [NASA Open Data Portal](https://data.nasa.gov/)
- [Earthdata](https://earthdata.nasa.gov/)
- [LP DAAC](https://lpdaac.usgs.gov/)
- [GPM Data](https://gpm.nasa.gov/)
- [TEMPO Mission](https://tempo.si.edu/)

### Urban Planning Resources
- [UN-Habitat](https://unhabitat.org/)
- [C40 Cities](https://www.c40.org/)
- [ICLEI](https://iclei.org/)

### Technical Documentation
- [React Documentation](https://reactjs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://docs.mongodb.com/)
- [Leaflet.js](https://leafletjs.com/)

## 🤝 Contributing

### How to Contribute
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Style
- Use ESLint and Prettier
- Follow React best practices
- Write meaningful commit messages
- Add JSDoc comments for functions

## 📞 Support

### Getting Help
- Create an issue on GitHub
- Check the troubleshooting section
- Review the NASA Space Apps Challenge resources

### Contact Information
- Project Team: [Your Team Contact]
- NASA Space Apps Challenge: https://www.spaceappschallenge.org/

---

## 🏆 NASA Space Apps Challenge Submission

This project addresses the "Data Pathways to Healthy Cities and Human Settlement" challenge by:

1. **Integrating NASA Earth Observation Data**: Real-time monitoring using multiple satellite datasets
2. **Risk Assessment**: Comprehensive environmental risk calculation
3. **Intervention Planning**: Nature-based solutions with cost-benefit analysis
4. **Urban Planning Tool**: Interactive dashboard for city planners
5. **Policy Support**: Automated report generation for stakeholders

### Deliverables Completed ✅
- [x] City Digital Twin (heat/flood/air/green monitoring)
- [x] Intervention Simulator (trees, cool roofs, wetlands)
- [x] Cost-Benefit Analysis calculator
- [x] Interactive web application
- [x] NASA data integration framework
- [x] Policy brief generator

**Built for NASA Space Apps Challenge 2024**
*Making cities healthier through space-based data and smart urban planning*
