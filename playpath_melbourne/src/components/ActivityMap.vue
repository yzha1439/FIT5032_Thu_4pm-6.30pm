<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  activities: { type: Array, required: true },
})

const emit = defineEmits(['register'])

const mapElement = ref(null)
const selectedId = ref('')
const userLocation = ref(null)
const locationStatus = ref(
  'Use your location to find the closest activity and estimate travel time.',
)
const isLocating = ref(false)
const isChoosingStart = ref(false)

let map
let markerLayer
let userMarker
let tripLine
const markers = new Map()

const selectedActivity = computed(() =>
  props.activities.find((activity) => String(activity.id) === selectedId.value),
)

const trip = computed(() => {
  if (!userLocation.value || !selectedActivity.value) return null
  const distance = haversineDistance(userLocation.value, selectedActivity.value.location)
  return {
    distance,
    walkingMinutes: Math.max(1, Math.round((distance / 4.8) * 60)),
    cyclingMinutes: Math.max(1, Math.round((distance / 15) * 60)),
  }
})

const directionsUrl = computed(() => {
  if (!selectedActivity.value) return ''
  const destination = `${selectedActivity.value.location.lat},${selectedActivity.value.location.lng}`
  const origin = userLocation.value ? `${userLocation.value.lat},${userLocation.value.lng}` : ''
  const parameters = new URLSearchParams({ api: '1', destination })
  if (origin) parameters.set('origin', origin)
  return `https://www.google.com/maps/dir/?${parameters}`
})

function haversineDistance(first, second) {
  const earthRadius = 6371
  const toRadians = (degrees) => (degrees * Math.PI) / 180
  const latitudeDifference = toRadians(second.lat - first.lat)
  const longitudeDifference = toRadians(second.lng - first.lng)
  const firstLatitude = toRadians(first.lat)
  const secondLatitude = toRadians(second.lat)
  const value =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDifference / 2) ** 2
  return earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
}

function popupContent(activity) {
  const container = document.createElement('div')
  const heading = document.createElement('strong')
  const detail = document.createElement('p')
  heading.textContent = activity.name
  detail.textContent = `${activity.location.venue}, ${activity.suburb} · ${activity.dateLabel}`
  container.append(heading, detail)
  return container
}

function drawTripLine() {
  if (tripLine) {
    tripLine.remove()
    tripLine = null
  }
  if (!map || !userLocation.value || !selectedActivity.value) return
  tripLine = L.polyline([userLocation.value, selectedActivity.value.location], {
    color: '#5b49df',
    weight: 4,
    dashArray: '8 8',
  }).addTo(map)
  map.stop()
  map.fitBounds(tripLine.getBounds(), { padding: [70, 70], maxZoom: 11 })
}

function selectActivity(activity, announce = true) {
  selectedId.value = String(activity.id)
  const marker = markers.get(activity.id)
  if (marker && map) {
    if (!userLocation.value) {
      map.flyTo([activity.location.lat, activity.location.lng], 13, { duration: 0.5 })
    }
    marker.openPopup()
  }
  drawTripLine()
  if (announce) locationStatus.value = `${activity.name} selected on the map.`
}

function fitActivityOverview() {
  if (!map || !props.activities.length) return
  const bounds = L.latLngBounds(
    props.activities.map((activity) => [activity.location.lat, activity.location.lng]),
  )
  map.stop()
  map.closePopup()
  map.fitBounds(bounds, { padding: [35, 35], maxZoom: 12, animate: false })
}

function renderMarkers() {
  if (!map || !markerLayer) return
  markerLayer.clearLayers()
  markers.clear()

  props.activities.forEach((activity) => {
    const marker = L.circleMarker([activity.location.lat, activity.location.lng], {
      radius: 9,
      color: '#241d3d',
      weight: 3,
      fillColor: activity.cost === 0 ? '#c7f464' : '#ff6b61',
      fillOpacity: 1,
    })
      .bindPopup(popupContent(activity))
      .on('click', () => selectActivity(activity, false))
      .addTo(markerLayer)
    markers.set(activity.id, marker)
  })

  fitActivityOverview()

  if (selectedId.value && !selectedActivity.value) selectedId.value = ''
}

function setStartLocation(location, sourceLabel) {
  userLocation.value = location
  if (userMarker) userMarker.remove()
  userMarker = L.circleMarker(location, {
    radius: 10,
    color: '#241d3d',
    weight: 3,
    fillColor: '#59c7ff',
    fillOpacity: 1,
  })
    .bindPopup(sourceLabel)
    .addTo(map)

  const nearest = [...props.activities].sort(
    (first, second) =>
      haversineDistance(location, first.location) - haversineDistance(location, second.location),
  )[0]
  if (nearest) {
    selectActivity(nearest, false)
    const distance = haversineDistance(location, nearest.location)
    locationStatus.value = `${nearest.name} is the closest visible activity, approximately ${distance.toFixed(1)} km away.`
    fitActivityOverview()
  } else {
    locationStatus.value = 'Starting point selected, but no activities match the current filters.'
  }
}

function locateUser() {
  if (!navigator.geolocation) {
    locationStatus.value = 'Geolocation is not supported by this browser.'
    return
  }
  isLocating.value = true
  locationStatus.value = 'Finding your location...'
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      setStartLocation({ lat: coords.latitude, lng: coords.longitude }, 'Your approximate location')
      isLocating.value = false
    },
    (error) => {
      isChoosingStart.value = true
      locationStatus.value =
        error.code === error.PERMISSION_DENIED
          ? 'Automatic location is unavailable. Click your starting point directly on the map.'
          : 'Your location could not be detected. Click your starting point directly on the map.'
      isLocating.value = false
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
  )
}

function chooseStartOnMap() {
  isChoosingStart.value = !isChoosingStart.value
  locationStatus.value = isChoosingStart.value
    ? 'Click anywhere on the map to choose your starting point.'
    : 'Manual starting-point selection cancelled.'
}

function resetMap() {
  isChoosingStart.value = false
  selectedId.value = ''
  if (tripLine) tripLine.remove()
  tripLine = null
  renderMarkers()
  locationStatus.value = userLocation.value
    ? 'Map reset. Your location remains available.'
    : 'Map reset. Choose an activity or use your location.'
}

watch(
  () => props.activities,
  () => nextTick(renderMarkers),
)

onMounted(() => {
  map = L.map(mapElement.value, { scrollWheelZoom: false }).setView([-37.8136, 144.9631], 11)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)
  markerLayer = L.layerGroup().addTo(map)
  map.on('click', ({ latlng }) => {
    if (!isChoosingStart.value) return
    setStartLocation({ lat: latlng.lat, lng: latlng.lng }, 'Your manually selected starting point')
    isChoosingStart.value = false
  })
  renderMarkers()
})

onBeforeUnmount(() => {
  map?.remove()
  map = null
})
</script>

<template>
  <section class="activity-map" aria-labelledby="activity-map-title">
    <div class="activity-map__heading">
      <div>
        <p class="eyebrow">Interactive map</p>
        <h3 id="activity-map-title">Plan your route to an activity</h3>
      </div>
      <p>{{ activities.length }} filtered locations shown</p>
    </div>

    <div class="activity-map__controls">
      <div>
        <label for="mapped-activity">Find an activity on the map</label>
        <select
          id="mapped-activity"
          v-model="selectedId"
          @change="selectedActivity && selectActivity(selectedActivity)"
        >
          <option value="">Choose an activity</option>
          <option v-for="activity in activities" :key="activity.id" :value="String(activity.id)">
            {{ activity.name }} — {{ activity.suburb }}
          </option>
        </select>
      </div>
      <button type="button" :disabled="isLocating || !activities.length" @click="locateUser">
        {{ isLocating ? 'Locating...' : 'Find nearest to me' }}
      </button>
      <button
        type="button"
        :class="{ 'activity-map__manual--active': isChoosingStart }"
        :disabled="!activities.length"
        :aria-pressed="isChoosingStart"
        @click="chooseStartOnMap"
      >
        {{ isChoosingStart ? 'Cancel choosing' : 'Choose start on map' }}
      </button>
      <button class="activity-map__reset" type="button" @click="resetMap">Reset map</button>
    </div>

    <p class="activity-map__status" role="status" aria-live="polite">{{ locationStatus }}</p>

    <div class="activity-map__layout">
      <div
        ref="mapElement"
        class="activity-map__canvas"
        :class="{ 'activity-map__canvas--choosing': isChoosingStart }"
        aria-label="Map of Melbourne activities"
      ></div>

      <aside class="activity-map__trip" aria-live="polite">
        <template v-if="selectedActivity">
          <span class="activity-map__badge">Selected activity</span>
          <h4>{{ selectedActivity.name }}</h4>
          <p>{{ selectedActivity.location.venue }}, {{ selectedActivity.suburb }}</p>
          <dl>
            <div>
              <dt>Date</dt>
              <dd>{{ selectedActivity.dateLabel }}</dd>
            </div>
            <div>
              <dt>Access</dt>
              <dd>{{ selectedActivity.accessibility }}</dd>
            </div>
            <template v-if="trip">
              <div>
                <dt>Direct distance</dt>
                <dd>{{ trip.distance.toFixed(1) }} km</dd>
              </div>
              <div>
                <dt>Est. walking</dt>
                <dd>{{ trip.walkingMinutes }} min</dd>
              </div>
              <div>
                <dt>Est. cycling</dt>
                <dd>{{ trip.cyclingMinutes }} min</dd>
              </div>
            </template>
          </dl>
          <p v-if="trip" class="activity-map__estimate-note">
            Travel estimates use direct distance and average speeds; check live directions before
            leaving.
          </p>
          <div class="activity-map__actions">
            <a :href="directionsUrl" target="_blank" rel="noopener noreferrer">Open directions</a>
            <button type="button" @click="emit('register', selectedActivity)">
              Register interest
            </button>
          </div>
        </template>
        <template v-else>
          <h4>Select a map location</h4>
          <p>Choose an activity to view venue and trip details.</p>
        </template>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.activity-map {
  margin-block: 2rem;
  padding: clamp(1rem, 3vw, 1.5rem);
  background: var(--lavender);
  border: 2px solid var(--ink);
  border-radius: 6px 24px 6px 24px;
  box-shadow: 8px 8px 0 var(--ink);
}

.activity-map__heading,
.activity-map__controls,
.activity-map__layout,
.activity-map__actions {
  display: flex;
  gap: 1rem;
}

.activity-map__heading {
  align-items: end;
  justify-content: space-between;
}

.activity-map__heading h3,
.activity-map__heading p,
.activity-map__trip h4,
.activity-map__trip p {
  margin: 0;
}

.activity-map__controls {
  flex-wrap: wrap;
  align-items: end;
  margin-top: 1rem;
}

.activity-map__controls > div {
  flex: 1 1 300px;
}

.activity-map__controls label {
  display: block;
  margin-bottom: 0.35rem;
  font-weight: 800;
}

.activity-map__controls select,
.activity-map__controls button,
.activity-map__actions a,
.activity-map__actions button {
  min-height: 44px;
  padding: 0.65rem 0.85rem;
  border: 2px solid var(--ink);
  border-radius: 4px 12px 4px 12px;
  font: inherit;
  font-weight: 800;
}

.activity-map__controls select {
  width: 100%;
  background: white;
}

.activity-map__controls button,
.activity-map__actions button {
  color: white;
  background: var(--primary);
  cursor: pointer;
}

.activity-map__controls .activity-map__reset {
  color: var(--ink);
  background: white;
}

.activity-map__controls .activity-map__manual--active {
  color: var(--ink);
  background: var(--lime);
}

.activity-map__controls button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.activity-map__status {
  min-height: 1.5rem;
  margin-block: 0.8rem;
  color: var(--ink-soft);
  font-weight: 700;
}

.activity-map__layout {
  align-items: stretch;
}

.activity-map__canvas {
  position: relative;
  z-index: 0;
  flex: 1 1 68%;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  min-height: 430px;
  overflow: hidden;
  border: 2px solid var(--ink);
  border-radius: 4px 18px 4px 18px;
  contain: paint;
}

.activity-map__canvas--choosing {
  cursor: crosshair;
  box-shadow: inset 0 0 0 4px var(--lime);
}

.activity-map__canvas--choosing :deep(.leaflet-control-attribution) {
  display: none;
}

.activity-map__canvas :deep(.leaflet-map-pane),
.activity-map__canvas :deep(.leaflet-control-container) {
  max-width: 100%;
}

.activity-map__trip {
  flex: 1 1 250px;
  padding: 1.2rem;
  background: white;
  border: 2px solid var(--ink);
  border-radius: 4px 18px 4px 18px;
}

.activity-map__badge {
  display: inline-block;
  margin-bottom: 0.8rem;
  padding: 0.25rem 0.55rem;
  color: var(--ink);
  background: var(--lime);
  border: 2px solid var(--ink);
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 900;
  text-transform: uppercase;
}

.activity-map__trip h4 {
  font-size: 1.25rem;
}

.activity-map__trip dl {
  display: grid;
  gap: 0.6rem;
  margin-block: 1rem;
}

.activity-map__trip dl div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--border);
}

.activity-map__trip dt {
  color: var(--ink-soft);
  font-weight: 700;
}

.activity-map__trip dd {
  margin: 0;
  text-align: right;
  font-weight: 800;
}

.activity-map__estimate-note {
  color: var(--ink-soft);
  font-size: 0.82rem;
}

.activity-map__actions {
  flex-wrap: wrap;
  margin-top: 1rem;
}

.activity-map__actions a {
  color: var(--ink);
  background: var(--lime);
  text-decoration: none;
}

@media (max-width: 760px) {
  .activity-map__heading,
  .activity-map__layout {
    align-items: stretch;
    flex-direction: column;
  }

  .activity-map__canvas {
    min-height: 360px;
  }
}
</style>
