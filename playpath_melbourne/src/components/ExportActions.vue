<script setup>
import { downloadCsv, downloadPdf } from '../services/export.js'

const props = defineProps({
  title: { type: String, required: true },
  filename: { type: String, required: true },
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
})

function exportData(format) {
  const options = {
    title: props.title,
    filename: props.filename,
    columns: props.columns,
    rows: props.rows,
  }
  if (format === 'csv') downloadCsv(options)
  else downloadPdf(options)
}
</script>

<template>
  <div class="export-actions" aria-label="Export current table results">
    <span>Export {{ rows.length }} {{ rows.length === 1 ? 'record' : 'records' }}</span>
    <button type="button" :disabled="!rows.length" @click="exportData('csv')">CSV</button>
    <button type="button" :disabled="!rows.length" @click="exportData('pdf')">PDF</button>
  </div>
</template>

<style scoped>
.export-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  align-items: center;
  justify-content: flex-end;
  margin-block: 0 1rem;
}

.export-actions span {
  margin-right: 0.2rem;
  color: var(--ink-soft);
  font-size: 0.88rem;
  font-weight: 700;
}

.export-actions button {
  padding: 0.5rem 0.8rem;
  color: var(--ink);
  background: var(--lime);
  border: 2px solid var(--ink);
  border-radius: 4px 11px 4px 11px;
  font-weight: 900;
  cursor: pointer;
}

.export-actions button:hover,
.export-actions button:focus-visible {
  color: white;
  background: var(--primary);
}

.export-actions button:disabled {
  color: var(--ink-soft);
  background: var(--border);
  cursor: not-allowed;
}
</style>
