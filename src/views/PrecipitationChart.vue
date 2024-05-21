<template>
  <div>
    <apexchart type="line" height="350" :options="chartOptions" :series="series"></apexchart>
  </div>
</template>

<script>
import ApexCharts from 'vue3-apexcharts'
import * as XLSX from 'xlsx'
import excelFile from '../assets/Tavole-Dati-Meteoclimatici-Anno-2021.xlsx'

export default {
  components: {
    apexchart: ApexCharts,
  },
  data() {
    return {
      chartOptions: {
        chart: {
          id: 'precipitation-chart'
        },
        xaxis: {
          categories: [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021]
        }
      },
      series: []
    }
  },
  mounted() {
    this.loadExcelData()
  },
  methods: {
    async loadExcelData() {
      const response = await fetch(excelFile)
      const arrayBuffer = await response.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })

      const sheetName = workbook.SheetNames[0]
      const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 })

      const data = this.processWorksheet(worksheet)
      this.series = this.formatData(data, 'Prec')
    },
    processWorksheet(worksheet) {
      const columns = ['Comune'].concat(
        worksheet[2].slice(1, 17).map(year => `Temp_${year}`),
        worksheet[2].slice(18).map(year => `Prec_${year}`)
      )

      const data = worksheet.slice(3).map(row => {
        const rowData = {}
        columns.forEach((col, i) => {
          rowData[col] = row[i]
        })
        return rowData
      })

      return data
    },
    formatData(data, type) {
      const formattedData = []
      data.forEach(row => {
        const name = row.Comune
        const values = Object.keys(row)
          .filter(key => key.startsWith(type))
          .map(key => parseFloat(row[key]))
        formattedData.push({
          name: name,
          data: values
        })
      })
      return formattedData
    }
  }
}
</script>

<style scoped>
</style>
