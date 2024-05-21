<template>
  <div>
    <h1>Temperature Chart</h1>
    <div id="chart">
      <apexchart
        type="line"
        :height="chartHeight"
        :options="chartOptions"
        :series="series"
        v-if="series.length && chartOptions.xaxis.categories.length"
      ></apexchart>
      <div v-else>Loading data...</div>
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
      chartHeight: '350px',
      chartOptions: {
        chart: {
          height: 350,
          type: 'line',
        },
        xaxis: {
          categories: [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
        },
        yaxis: {
          labels: {
            formatter: function (val) {
              return val.toFixed(2) + " °C";
            }
          }
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
        const seriesData = this.formatData(data, 'Temp')

        console.log("Processed data:", seriesData); // Log di debug

        if (seriesData.length > 0) {
          this.series = seriesData
          this.chartOptions.xaxis.categories = [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021]
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
          data: values.map(value => isNaN(value) ? avgValue : value).map(value => parseFloat(value.toFixed(2)))
        }
      })
    },
    adjustChartSize() {
      this.chartHeight = window.innerWidth > 1200 ? '500px' : '350px'
    }
  }
}
</script>

<style scoped>
#chart {
  margin-top: 20px;
  width: 100%;
}
@media (max-width: 600px) {
  #chart {
    height: 300px;
  }
}
</style>
