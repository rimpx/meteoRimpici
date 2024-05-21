<template>
  <div class="container">
    <h1>TEMPERATURE</h1>

    <!-- Temperature Chart -->
    <div>
      <apexchart type="line" height="350" :options="chartOptions" :series="series"></apexchart>
    </div>

    <!-- Data Table -->
    <table v-if="jsonData.length">
      <thead>
        <tr>
          <th v-for="key in headers" :key="key" :class="{ 'text-left': key === 'Anno' || key === 'Città', 'text-right': key !== 'Anno' && key !== 'Città' }">{{ key }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in jsonData.slice(0, 5)" :key="index">
          <td v-for="(value, key) in row" :key="key" :class="{ 'text-left': key === 'Anno' || key === 'Città', 'text-right': key !== 'Anno' && key !== 'Città' }">
            {{ value }}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Information Card for the City -->
    <div class="card" v-if="selectedCity">
      <h2>{{ selectedCity }}</h2>
      <!-- Additional city information here... -->
      <button @click="closeCard">Chiudi</button>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';
import VueApexCharts from 'vue3-apexcharts';

export default {
  name: 'HomeView',
  components: {
    apexchart: VueApexCharts
  },
  data() {
    return {
      jsonData: [],
      headers: [],
      chartOptions: {
        chart: {
          id: 'temperature-chart'
        },
        xaxis: {
          categories: []
        },
        yaxis: {
          title: {
            text: 'Temperature (°C)'
          }
        }
      },
      series: [],
      selectedCity: null
    };
  },
  mounted() {
    this.loadExcelFile();
  },
  methods: {
    async loadExcelFile() {
      try {
        const response = await fetch(new URL('@/assets/Temperature.xlsx', import.meta.url));
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        let json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        this.headers = json[0];
        json.shift(); // Remove the header row

        this.jsonData = json.map((row, index) => {
          if (index < 5) { // Only process the first 5 rows
            let obj = {};
            this.headers.forEach((header, index) => {
              obj[header] = row[index];
            });
            return obj;
          }
        }).filter(item => item !== undefined);

        this.chartOptions.xaxis.categories = this.headers.slice(1); // Assuming first header is 'Città'

        this.series = [{
          name: 'Temperature',
          data: this.jsonData.map(row => this.headers.slice(1).map(year => row[year]))
        }];

      } catch (error) {
        console.error('Error loading the Excel file:', error);
      }
    }
  }
};
</script>

<style scoped>
.container {
  margin: 0 5%;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid;
  padding: 8px;
}
th {
  background-color: #f2f2f2;
  font-weight: bold;
}
.text-left {
  text-align: left;
}
.text-right {
  text-align: right;
}
.card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #ffffff;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>

