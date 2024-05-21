<template>
  <div id="chart">
    <apexchart
      type="bar"
      height="350"
      :options="chartOptions"
      :series="series"
      v-if="series.length && chartOptions.xaxis.categories.length"
    ></apexchart>
    <div v-else>Loading data...</div>
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
      chartOptions: {
        chart: {
          height: 350,
          type: 'bar',
        },
        plotOptions: {
          bar: {
            borderRadius: 4,
            borderRadiusApplication: 'end',
            horizontal: true,
          }
        },
        dataLabels: {
          enabled: false
        },
        xaxis: {
          categories: [], // Sarà riempito con i comuni
        },
        title: {
          text: 'Average Temperature by City',
          floating: true,
          offsetY: 330,
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
        const seriesData = this.formatData(data, 'Temp')

        console.log("Processed data:", seriesData); // Log di debug

        if (seriesData.length > 0) {
          this.series = [{ name: 'Temperature', data: seriesData.map(item => item.data) }]
          this.chartOptions.xaxis.categories = seriesData.map(item => item.name)
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
    formatData(data, type) {
      return data.map(row => {
        const values = Object.keys(row)
          .filter(key => key.startsWith(type))
          .map(key => parseFloat(row[key]))

        const validValues = values.filter(value => !isNaN(value))
        const avgValue = validValues.reduce((a, b) => a + b, 0) / validValues.length

        return {
          name: row.Comune,
          data: values.map(value => isNaN(value) ? avgValue : value)
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
