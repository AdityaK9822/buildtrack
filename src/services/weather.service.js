const axios = require('axios');
const config = require('../config');
const Project = require('../models/Project');
const fcmService = require('./fcm.service');

class WeatherService {
  async getWeatherByLocation(lat, lng) {
    try {
      const response = await axios.get(`${config.weatherApi.url}/weather`, {
        params: {
          lat,
          lon: lng,
          appid: config.weatherApi.key,
          units: 'metric',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Weather API error:', error.message);
      return null;
    }
  }

  async get5DayForecast(lat, lng) {
    try {
      const response = await axios.get(`${config.weatherApi.url}/forecast`, {
        params: {
          lat,
          lon: lng,
          appid: config.weatherApi.key,
          units: 'metric',
          cnt: 40,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Forecast API error:', error.message);
      return null;
    }
  }

  calculateDelayRisk(weatherData) {
    const riskFactors = {
      highTemp: weatherData.main?.temp > 40,
      lowTemp: weatherData.main?.temp < 5,
      highWind: weatherData.wind?.speed > 15,
      heavyRain:
        weatherData.weather[0]?.main === 'Rain' && weatherData.rain?.['3h'] > 10,
      thunderstorm: weatherData.weather[0]?.main === 'Thunderstorm',
      snow: weatherData.weather[0]?.main === 'Snow',
      extremeWeather: weatherData.weather[0]?.main === 'Extreme',
    };

    const riskCount = Object.values(riskFactors).filter(Boolean).length;

    if (riskCount >= 3) return 'high';
    if (riskCount >= 1) return 'medium';
    return 'low';
  }

  getRecommendations(weatherData) {
    const recommendations = [];

    if (weatherData.weather[0]?.main === 'Rain') {
      recommendations.push('Delay outdoor concrete work');
      recommendations.push('Cover building materials');
    }

    if (weatherData.main?.temp > 35) {
      recommendations.push('Schedule heavy work for early morning');
      recommendations.push('Ensure worker hydration');
    }

    if (weatherData.wind?.speed > 15) {
      recommendations.push('Avoid crane operations');
      recommendations.push('Secure loose materials');
    }

    if (weatherData.weather[0]?.main === 'Thunderstorm') {
      recommendations.push('Evacuate site immediately');
      recommendations.push('Disconnect electrical equipment');
    }

    return recommendations;
  }

  async getProjectWeatherPrediction(projectId) {
    const project = await Project.findById(projectId).populate('clientId contractorId');

    if (!project) {
      throw new Error('Project not found');
    }

    if (!project.location?.coordinates) {
      throw new Error('Project location coordinates not found');
    }

    const { lat, lng } = project.location.coordinates;
    const forecast = await this.get5DayForecast(lat, lng);

    if (!forecast) {
      throw new Error('Weather forecast unavailable');
    }

    const prediction = forecast.list.map((item) => ({
      date: new Date(item.dt * 1000),
      condition: item.weather[0].main,
      description: item.weather[0].description,
      temperature: item.main.temp,
      humidity: item.main.humidity,
      windSpeed: item.wind.speed,
      precipitation: item.rain?.['3h'] || 0,
      delayRisk: this.calculateDelayRisk(item),
      recommendations: this.getRecommendations(item),
    }));

    // Calculate overall project delay risk
    const highRiskDays = prediction.filter((p) => p.delayRisk === 'high').length;
    const overallRisk =
      highRiskDays >= 2 ? 'high' : highRiskDays >= 1 ? 'medium' : 'low';

    return {
      projectId,
      location: project.location,
      forecast: prediction,
      overallRisk,
      summary: this.generateSummary(prediction),
    };
  }

  generateSummary(forecast) {
    const rainyDays = forecast.filter((f) => f.condition === 'Rain').length;
    const hotDays = forecast.filter((f) => f.temperature > 35).length;

    return `${rainyDays} day(s) with rain expected. ${hotDays} day(s) with high temperatures. ${
      rainyDays >= 3 ? 'Potential delays possible.' : 'Weather looks favorable.'
    }`;
  }

  async checkProjectWeather(projectId) {
    const prediction = await this.getProjectWeatherPrediction(projectId);

    // Send alert if high risk predicted
    if (prediction.overallRisk === 'high') {
      const project = await Project.findById(projectId);
      const stakeholders = [
        project.clientId,
        project.contractorId,
        project.architectId,
      ].filter(Boolean);

      await fcmService.sendToMultiple(stakeholders, {
        title: '⚠️ Weather Alert',
        message: prediction.summary,
        type: 'weather-alert',
        relatedProject: projectId,
        data: { severity: 'high', delayRisk: prediction.overallRisk },
      });
    }

    return prediction;
  }
}

module.exports = new WeatherService();
