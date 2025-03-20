# FarmGazer 2.0

A Next.js application for agricultural monitoring and analysis, deployed on Azure Web Services. The deployment process is automated using GitHub Actions workflow.
Live demo: [FarmGazer 2.0](https://farmgazer2-finaldemo.azurewebsites.net/) 


## 🌾 Overview

FarmGazer 2.0 is a web application that provides real-time monitoring and analysis of agricultural conditions using data from IoT devices. The application displays information about:
- Weed detections
- Drought conditions
- Disease identification
- Water pooling issues

## 🚀 Technologies

- Frontend: Next.js 13.5.1 with TypeScript
- UI: Tailwind CSS with Shadcn/ui components
- Database: Azure SQL Server
- Storage: Azure Blob Storage
- Deployment: Azure Web Services

## 🔧 Key Features

- Real-time environmental data monitoring
- Image analysis and categorization
- Temperature and humidity tracking
- Device-specific data collection
- Responsive design for multiple devices

## 💻 Development

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Azure account with necessary services configured

### Environment Variables

Required environment variables:
AZURE_SQL_SERVER=your_server
AZURE_SQL_DATABASE=your_database
AZURE_SQL_USER=your_username
AZURE_SQL_PASSWORD=your_password
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
AZURE_STORAGE_CONTAINER_NAME=your_container_name

## 🌐 Deployment

The application is deployed on Azure Web Services. The deployment process is automated using GitHub Actions workflow.

Live demo: [FarmGazer 2.0](https://farmgazer2app-ducnavhaadahdefa.eastus-01.azurewebsites.net/database)

## 📁 Project Structure

The project follows Next.js 13 app directory structure:
- `/app`: Application routes and API endpoints
- `/components`: Reusable UI components
- `/lib`: Utility functions and database connections
- `/public`: Static assets
- `/types`: TypeScript type definitions

## 📄 API Endpoints

- `/api/items`: Fetches daily detection records
- `/api/detection/[id]`: Retrieves specific detection details
- `/api/database`: Gets latest 40 detection records

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License...
