function normaliseCell(value) {
  if (value === null || value === undefined) return ''
  return String(value)
}

function timestampedFilename(baseName, extension) {
  const date = new Date().toISOString().slice(0, 10)
  return `${baseName}-${date}.${extension}`
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function csvCell(value) {
  const text = normaliseCell(value)
  return `"${text.replaceAll('"', '""')}"`
}

export function downloadCsv({ filename, columns, rows }) {
  const header = columns.map((column) => csvCell(column.label)).join(',')
  const body = rows.map((row) => columns.map((column) => csvCell(row[column.key])).join(','))
  const csv = `\uFEFF${[header, ...body].join('\r\n')}`

  downloadBlob(
    new Blob([csv], { type: 'text/csv;charset=utf-8' }),
    timestampedFilename(filename, 'csv'),
  )
}

function pdfText(value) {
  return normaliseCell(value)
    .replaceAll('–', '-')
    .replaceAll('—', '-')
    .replaceAll('’', "'")
    .replaceAll('“', '"')
    .replaceAll('”', '"')
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]/g, '?')
    .replaceAll('\\', '\\\\')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)')
}

function fitText(value, width, fontSize = 8) {
  const text = pdfText(value)
  const characterLimit = Math.max(4, Math.floor(width / (fontSize * 0.53)))
  return text.length <= characterLimit ? text : `${text.slice(0, characterLimit - 3)}...`
}

function createPageStream({ title, subtitle, columns, rows, pageNumber, pageTotal }) {
  const pageWidth = 842
  const margin = 36
  const tableWidth = pageWidth - margin * 2
  const rowHeight = 22
  const headerY = 500
  const totalWeight = columns.reduce((total, column) => total + (column.width || 1), 0)
  const widths = columns.map((column) => ((column.width || 1) / totalWeight) * tableWidth)
  const commands = [
    '0.13 0.10 0.24 rg',
    'BT /F2 18 Tf 36 552 Td',
    `(${pdfText(title)}) Tj ET`,
    '0.36 0.29 0.88 rg',
    'BT /F1 9 Tf 36 534 Td',
    `(${pdfText(subtitle)}) Tj ET`,
    '0.13 0.10 0.24 rg',
    `${margin} ${headerY} ${tableWidth} ${rowHeight} re f`,
  ]

  let x = margin
  columns.forEach((column, index) => {
    commands.push('1 1 1 rg', `BT /F2 8 Tf ${x + 5} ${headerY + 7} Td`)
    commands.push(`(${fitText(column.label, widths[index] - 10, 8)}) Tj ET`)
    x += widths[index]
  })

  rows.forEach((row, rowIndex) => {
    const y = headerY - (rowIndex + 1) * rowHeight
    if (rowIndex % 2 === 1) {
      commands.push('0.95 0.94 1 rg', `${margin} ${y} ${tableWidth} ${rowHeight} re f`)
    }
    commands.push('0.83 0.82 0.88 RG', `${margin} ${y} m ${margin + tableWidth} ${y} l S`)
    x = margin
    columns.forEach((column, index) => {
      commands.push('0.13 0.10 0.24 rg', `BT /F1 8 Tf ${x + 5} ${y + 7} Td`)
      commands.push(`(${fitText(row[column.key], widths[index] - 10, 8)}) Tj ET`)
      x += widths[index]
    })
  })

  commands.push(
    '0.38 0.37 0.48 rg',
    'BT /F1 8 Tf 36 24 Td',
    `(PlayPath Melbourne | Page ${pageNumber} of ${pageTotal}) Tj ET`,
  )
  return commands.join('\n')
}

export function createTablePdfBlob({ title, columns, rows }) {
  const rowsPerPage = 20
  const pages = []
  for (let index = 0; index < Math.max(rows.length, 1); index += rowsPerPage) {
    pages.push(rows.slice(index, index + rowsPerPage))
  }

  const objects = []
  const addObject = (content) => {
    objects.push(content)
    return objects.length
  }

  const catalogId = addObject('')
  const pagesId = addObject('')
  const regularFontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
  const boldFontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>')
  const pageIds = []

  pages.forEach((pageRows, index) => {
    const stream = createPageStream({
      title,
      subtitle: `${rows.length} exported record${rows.length === 1 ? '' : 's'}`,
      columns,
      rows: pageRows,
      pageNumber: index + 1,
      pageTotal: pages.length,
    })
    const contentId = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`)
    const pageId = addObject(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 842 595] /Resources << /Font << /F1 ${regularFontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${contentId} 0 R >>`,
    )
    pageIds.push(pageId)
  })

  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`
  objects[pagesId - 1] =
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const crossReferenceOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${crossReferenceOffset}\n%%EOF`

  return new Blob([pdf], { type: 'application/pdf' })
}

export function downloadPdf({ filename, title, columns, rows }) {
  downloadBlob(createTablePdfBlob({ title, columns, rows }), timestampedFilename(filename, 'pdf'))
}
