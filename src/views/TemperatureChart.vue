<template>
  <div class="container">
    <h1>Temperature Chart</h1>
    <div class="select-container">
      <label for="year-select">Select Year: </label>
      <select id="year-select" v-model="selectedYear" @change="updateChart">
        <option value="all">All Years</option>
        <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
      </select>
      <button @click="showTop10Cities" class="button">Show Top 10 Cities</button>
      <button @click="showAllCities" class="button">Show All Cities</button>
    </div>
    <div id="chart">
      <apexchart
        type="bar"
        :height="chartHeight"
        :options="chartOptions"
        :series="series"
        v-if="series.length && chartOptions.xaxis.categories.length"
      ></apexchart>
      <div v-else>Loading data...</div>
    </div>
    <h2>Data Table</h2>
    <div id="table-container">
      <table>
        <thead>
          <tr>
            <th>Comune</th>
            <th v-for="year in years" :key="year">{{ year }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in tableData" :key="index" :class="{ highlighted: top10Cities.includes(row.Comune) }">
            <td>{{ row.Comune }}</td>
            <td v-for="year in years" :key="year">{{ row[`Temp_${year}`] }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import ApexCharts from 'vue3-apexcharts'
import * as XLSX from 'xlsx'
import temperatureFile from '../assets/Temperature.xlsx'

export default {
  components: {
    apexchart: ApexCharts,
  },
  data() {
    return {
      series: [],
      tableData: [],
      years: [],
      selectedYear: '',
      chartHeight: '500px',
      top10Cities: [],
      chartOptions: {
        chart: {
          height: 500,
          type: 'bar',
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded'
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent'],
        },
        xaxis: {
          categories: [],
          labels: {
            rotate: -45,
            maxHeight: 100,
            style: {
              fontSize: '12px'
            }
          }
        },
        yaxis: {
          title: {
            text: 'Temperature (°C)'
          },
          labels: {
            formatter: function (val) {
              if (typeof val !== 'number') return val;
              return val.toFixed(2) + " °C";
            }
          }
        },
        fill: {
          opacity: 1,
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val.toFixed(2) + " °C";
            }
          }
        },
        title: {
          text: 'Average Temperature by City',
          floating: true,
          align: 'center',
          style: {
            color: '#444'
          }
        }
      }
    }
  },
  mounted() {
    this.loadExcelData()
    this.adjustChartSize()
    window.addEventListener('resize', this.adjustChartSize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.adjustChartSize)
  },
  methods: {
    async loadExcelData() {
      try {
        const response = await fetch(temperatureFile)
        const arrayBuffer = await response.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })

        const sheetName = workbook.SheetNames[0]
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 })

        const data = this.processWorksheet(worksheet)
        this.tableData = this.formatDataForTable(data)
        const categories = worksheet[0].slice(1) // Ottieni le categorie (anni) dal primo row del worksheet

        if (data.length > 0) {
          this.years = categories
          this.selectedYear = categories[categories.length - 1] // Imposta l'anno più recente come default
          this.updateChartData(data, this.selectedYear)
        } else {
          console.error("No valid data found for temperature.")
        }
      } catch (error) {
        console.error("Error loading or processing Excel data:", error)
      }
    },
    processWorksheet(worksheet) {
      const columns = ['Comune'].concat(
        worksheet[0].slice(1).map(year => `Temp_${year}`)
      )

      const data = worksheet.slice(1).map(row => {
        const rowData = {}
        columns.forEach((col, i) => {
          rowData[col] = row[i]
        })
        return rowData
      })

      return data
    },
    formatDataForChart(data, year) {
      if (year === 'all') {
        return this.years.map(year => {
          return {
            name: year,
            data: data.map(row => {
              const value = parseFloat(row[`Temp_${year}`])
              const validValues = Object.keys(row)
                .filter(key => key.startsWith('Temp') && !isNaN(parseFloat(row[key])))
                .map(key => parseFloat(row[key]))

              const avgValue = validValues.reduce((a, b) => a + b, 0) / validValues.length
              return isNaN(value) ? avgValue : value
            }).map(value => parseFloat(value.toFixed(2)))
          }
        })
      } else {
        return data.map(row => {
          const value = parseFloat(row[`Temp_${year}`])
          const validValues = Object.keys(row)
            .filter(key => key.startsWith('Temp') && !isNaN(parseFloat(row[key])))
            .map(key => parseFloat(row[key]))

          const avgValue = validValues.reduce((a, b) => a + b, 0) / validValues.length
          return {
            name: row.Comune,
            data: [isNaN(value) ? avgValue : value].map(value => parseFloat(value.toFixed(2)))
          }
        })
      }
    },
    formatDataForTable(data) {
      return data.map(row => {
        const formattedRow = { Comune: row.Comune }
        Object.keys(row).forEach(key => {
          if (key.startsWith('Temp_')) {
            formattedRow[key] = isNaN(row[key]) ? '-' : parseFloat(row[key]).toFixed(2)
          }
        })
        return formattedRow
      })
    },
    updateChart() {
      const data = this.tableData
      this.updateChartData(data, this.selectedYear)
    },
    updateChartData(data, year) {
      if (year === 'all') {
        const seriesData = this.formatDataForChart(data, year)
        this.series = seriesData
        this.chartOptions.xaxis.categories = data.map(row => row.Comune)
      } else {
        const seriesData = this.formatDataForChart(data, year)
        this.series = [{ data: seriesData.map(d => d.data[0]), name: `Temperature in ${year}` }]
        this.chartOptions.xaxis.categories = seriesData.map(d => d.name)
      }
    },
    showTop10Cities() {
      const data = this.tableData.map(row => {
        return {
          Comune: row.Comune,
          value: parseFloat(row[`Temp_${this.selectedYear}`]) || 0
        }
      }).sort((a, b) => b.value - a.value).slice(0, 10)

      this.top10Cities = data.map(row => row.Comune)
      this.series = [{ data: data.map(row => row.value), name: `Top 10 Cities in ${this.selectedYear}` }]
      this.chartOptions.xaxis.categories = this.top10Cities
    },
    showAllCities() {
      this.top10Cities = []
      this.updateChart()
    },
    adjustChartSize() {
      this.chartHeight = window.innerWidth > 1200 ? '600px' : '400px'
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 100%;
  padding: 20px;
}

.select-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.select-container label {
  margin-right: 10px;
}

.select-container select {
  margin-right: 10px;
}

.button {
  margin-left: 10px;
  padding: 5px 10px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.button:hover {
  background-color: #e9e9e9
}

#chart {
  margin-top: 20px;
  width: 100%;
}

#table-container {
  margin-top: 20px;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 8px;
  text-align: center;
  border: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
}

tr.highlighted {
  background-color: #ffef96;
}

@media (max-width: 600px) {
  #chart {
    height: 300px;
  }
  th, td {
    padding: 4px;
  }
  h1 {
    font-size: 24px;
  }
  h2 {
    font-size: 20px;
  }
}
</style>
