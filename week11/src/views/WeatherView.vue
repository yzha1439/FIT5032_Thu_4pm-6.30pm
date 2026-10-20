<template>
  <main class="weather-page">
    <section class="weather-card">
      <h1>Weather App</h1>

      <form @submit.prevent="searchByCity">
        <input
          v-model.trim="city"
          type="text"
          placeholder="Enter city, for example Clayton, AU"
        >
        <button type="submit" :disabled="loading">
          {{ loading ? 'Loading...' : 'Search' }}
        </button>
      </form>

      <p v-if="errorMessage" class="error">
        {{ errorMessage }}
      </p>

      <div v-if="weatherData" class="weather-result">
        <h2>
          {{ weatherData.name }}, {{ weatherData.sys.country }}
        </h2>

        <img
          :src="iconUrl"
          :alt="weatherData.weather[0].description"
        >

        <p class="temperature">
          {{ Math.round(weatherData.main.temp) }} °C
        </p>

        <p class="description">
          {{ weatherData.weather[0].description }}
        </p>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'

const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY

const city = ref('')
const weatherData = ref(null)
const loading = ref(false)
const errorMessage = ref('')

const iconUrl = computed(() => {
  if (!weatherData.value) {
    return ''
  }

  const icon = weatherData.value.weather[0].icon
  return `https://openweathermap.org/img/wn/${icon}@2x.png`
})

const fetchWeatherData = async (parameters) => {
  if (!apiKey) {
    errorMessage.value = 'OpenWeather API key is not configured.'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await axios.get(
      'https://api.openweathermap.org/data/2.5/weather',
      {
        params: {
          ...parameters,
          appid: apiKey,
          units: 'metric',
        },
      },
    )

    weatherData.value = response.data
  } catch (error) {
    console.error('Unable to retrieve weather:', error)
    errorMessage.value = 'Unable to retrieve the weather.'
  } finally {
    loading.value = false
  }
}

const fetchCurrentLocationWeather = () => {
  if (!navigator.geolocation) {
    errorMessage.value = 'Geolocation is not supported.'
    return
  }

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      fetchWeatherData({
        lat: coords.latitude,
        lon: coords.longitude,
      })
    },
    () => {
      errorMessage.value =
        'Please allow location access to view local weather.'
    },
  )
}

const searchByCity = () => {
  if (!city.value) {
    errorMessage.value = 'Please enter a city.'
    return
  }

  fetchWeatherData({
    q: city.value,
  })
}

onMounted(() => {
  fetchCurrentLocationWeather()
})
</script>

<style scoped>
.weather-page {
  min-height: calc(100vh - 59px);
  display: grid;
  place-items: center;
  padding: 40px 24px;
  background: #f3f6fb;
}

.weather-card {
  width: min(520px, 100%);
  padding: 32px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 12px 32px rgb(15 23 42 / 12%);
}

form {
  display: flex;
  gap: 10px;
  margin: 24px 0;
}

input {
  flex: 1;
  padding: 12px;
}

button {
  padding: 12px 20px;
  border: 0;
  border-radius: 8px;
  color: white;
  background: #2563eb;
  font-weight: 700;
}

.weather-result {
  text-align: center;
}

.temperature {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
}

.description {
  text-transform: capitalize;
  color: #64748b;
}

.error {
  color: #dc2626;
}
</style>