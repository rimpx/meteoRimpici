<template>
  <div>
    <h1>Precipitation Chart</h1>
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
    <h2>Data Table</h2>
    <div id="table-container">
      <table>
        <thead>
          <tr>
            <th>Comune</th>
            <th v-for="year in chartOptions.xaxis.categories" :key="year">{{ year }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in tableData" :key="index">
            <td>{{ row.Comune }}</td>
            <td v-for="year in chartOptions.xaxis.categories" :key="year">{{ row[`Prec_${year}`] }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import ApexCharts from 'vue3-apexcharts'
import * as XLSX from 'xlsx'
import precipitationFile from '../assets/Precipitazioni.xlsx'

export default {
  components: {
    apexchart: ApexCharts,
  },
  data() {
    return {
      series: [],
      tableData: [],
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
              return val.toFixed(2) + " mm";
            }
          }
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val.toFixed(2) + " mm";
            }
          }
        },
        title: {
          text: 'Precipitation in Various Cities',
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
        const response = await fetch(precipitationFile)
        const arrayBuffer = await response.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })

        const sheetName = workbook.SheetNames[0]
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 })

        const data = this.processWorksheet(worksheet)
        this.tableData = this.formatDataForTable(data)
        const seriesData = this.formatDataForChart(data, 'Prec')

        console.log("Processed data:", seriesData); // Log di debug

        if (seriesData.length > 0) {
          this.series = seriesData
          this.chartOptions.xaxis.categories = [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021]
        } else {
          console.error("No valid data found for precipitation.")
        }
      } catch (error) {
        console.error("Error loading or processing Excel data:", error)
      }
    },
    processWorksheet(worksheet) {
      const columns = ['Comune'].concat(
        worksheet[0].slice(1).map(year => `Prec_${year}`)
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
    formatDataForChart(data, type) {
      return data.map(row => {
        const values = Object.keys(row)
          .filter(key => key.startsWith(type))
          .map(key => parseFloat(row[key]))

        const validValues = values.filter(value => !isNaN(value) && value > 1)
        const avgValue = validValues.reduce((a, b) => a + b, 0) / validValues.length

        return {
          name: row.Comune,
          data: values.map(value => (isNaN(value) || value <= 1) ? avgValue : value).map(value => parseFloat(value.toFixed(2)))
        }
      })
    },
    formatDataForTable(data) {
      return data.map(row => {
        const formattedRow = { Comune: row.Comune }
        Object.keys(row).forEach(key => {
          if (key.startsWith('Prec_')) {
            formattedRow[key] = isNaN(row[key]) || row[key] <= 1 ? '-' : parseFloat(row[key]).toFixed(2)
          }
        })
        return formattedRow
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
