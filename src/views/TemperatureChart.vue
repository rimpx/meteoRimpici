<template>
  <div class="container">
    <h1>Temperature Chart</h1>
    <div class="select-container">
      <label for="year-select">Select Year: </label>
      <select id="year-select" v-model="selectedYear" @change="updateChart">
        <option value="all">All Years</option>
        <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
      </select>
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in tableData" :key="index">
            <td>{{ row.Comune }}</td>
            <td v-for="year in years" :key="year">
              <input type="number" v-model="row[`Temp_${year}`]" @change="updateTemperature(index, year, $event)" />
            </td>
            <td>
              <button @click="deleteCity(index)">Delete</button>
            </td>
          </tr>
          <tr>
            <td><input type="text" v-model="newCity" placeholder="New City" /></td>
            <td v-for="year in years" :key="year">
              <input type="number" v-model="newTemperatures[year]" placeholder="Temp" />
            </td>
            <td><button @click="addCity">Add</button></td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td><input type="text" v-model="newYear" placeholder="New Year" /></td>
            <td :colspan="years.length + 1"><button @click="addYear">Add Year</button></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script>
import ApexCharts from 'vue3-apexcharts';
import * as XLSX from 'xlsx';
import temperatureFile from '../assets/Temperature.xlsx';

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
      newCity: '',
      newTemperatures: {},
      newYear: '',
      chartHeight: '500px',
      chartOptions: {
        chart: {
          height: 500,
          type: 'bar',
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded',
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
              fontSize: '12px',
            },
          },
        },
        yaxis: {
          title: {
            text: 'Temperature (°C)',
          },
          labels: {
            formatter: function (val) {
              if (typeof val !== 'number') return val;
              return val.toFixed(2) + ' °C';
            },
          },
        },
        fill: {
          opacity: 1,
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val.toFixed(2) + ' °C';
            },
          },
        },
        title: {
          text: 'Average Temperature by City',
          floating: true,
          align: 'center',
          style: {
            color: '#444',
          },
        },
      },
    };
  },
  mounted() {
    this.loadFromLocalStorage();
    this.loadExcelData();
    this.adjustChartSize();
    window.addEventListener('resize', this.adjustChartSize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.adjustChartSize);
  },
  methods: {
    async loadExcelData() {
      try {
        const response = await fetch(temperatureFile);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

        const data = this.processWorksheet(worksheet);
        const categories = worksheet[0].slice(1); // Get the categories (years) from the first row of the worksheet

        if (data.length > 0) {
          this.years = categories;
          this.selectedYear = categories[categories.length - 1]; // Set the most recent year as default
          this.updateChartData(data, this.selectedYear);
          this.tableData = this.formatDataForTable(data);
          this.saveToLocalStorage(); // Save initial load to local storage
        } else {
          console.error('No valid data found for temperature.');
        }
      } catch (error) {
        console.error('Error loading or processing Excel data:', error);
      }
    },
    processWorksheet(worksheet) {
      const columns = ['Comune'].concat(
        worksheet[0].slice(1).map((year) => `Temp_${year}`)
      );

      const data = worksheet.slice(1).map((row) => {
        const rowData = {};
        columns.forEach((col, i) => {
          rowData[col] = row[i];
        });
        return rowData;
      });

      return data;
    },
    formatDataForTable(data) {
      return data.map((row) => {
        const formattedRow = { Comune: row.Comune };
        Object.keys(row).forEach((key) => {
          if (key.startsWith('Temp_')) {
            formattedRow[key] = isNaN(row[key]) ? '-' : parseFloat(row[key]).toFixed(2);
          }
        });
        return formattedRow;
      });
    },
    updateChart() {
      this.updateChartData(this.tableData, this.selectedYear);
    },
    updateChartData(data, year) {
      const seriesData = this.formatDataForChart(data, year);
      this.series = [{ data: seriesData.map((d) => d.data[0]), name: `Temperature in ${year}` }];
      this.chartOptions.xaxis.categories = seriesData.map((d) => d.name);
      this.saveToLocalStorage();
    },
    formatDataForChart(data, year) {
      if (year === 'all') {
        return this.years.map((yr) => {
          return {
            name: yr,
            data: data.map((row) => parseFloat(row[`Temp_${yr}`] || 0).toFixed(2)),
          };
        });
      } else {
        return data
          .filter((row) => row[`Temp_${year}`] !== undefined)
          .map((row) => ({
            name: row.Comune,
            data: [parseFloat(row[`Temp_${year}`] || 0).toFixed(2)],
          }));
      }
    },
    addCity() {
      if (this.newCity && Object.keys(this.newTemperatures).length === this.years.length) {
        const newRow = { Comune: this.newCity };
        this.years.forEach((year) => {
          newRow[`Temp_${year}`] = this.newTemperatures[year] || '-';
        });
        this.tableData.push(newRow);
        this.newCity = '';
        this.newTemperatures = {};
        this.updateChart();
        this.saveToLocalStorage();
      }
    },
    addYear() {
      if (this.newYear) {
        this.years.push(this.newYear);
        this.tableData.forEach((row) => {
          row[`Temp_${this.newYear}`] = '-';
        });
        this.newYear = '';
        this.updateChart();
        this.saveToLocalStorage();
      }
    },
    deleteCity(index) {
      this.tableData.splice(index, 1);
      this.updateChart();
      this.saveToLocalStorage();
    },
    updateTemperature(index, year, event) {
      const newValue = event.target.value;
      this.tableData[index][`Temp_${year}`] = parseFloat(newValue).toFixed(2);
      this.updateChart();
      this.saveToLocalStorage();
    },
    adjustChartSize() {
      this.chartHeight = window.innerWidth > 1200 ? '600px' : (window.innerWidth > 600 ? '400px' : '300px');
    },
    saveToLocalStorage() {
      const dataToStore = {
        tableData: this.tableData,
        years: this.years
      };
      localStorage.setItem('temperatureData', JSON.stringify(dataToStore));
    },
    loadFromLocalStorage() {
      const storedData = localStorage.getItem('temperatureData');
      if (storedData) {
        const { tableData, years } = JSON.parse(storedData);
        this.tableData = tableData;
        this.years = years;
        this.selectedYear = years[years.length - 1];
        this.updateChart();
      }
    }
  }
};
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
  flex-wrap: wrap;
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
  background-color: #e9e9e9;
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

.form-container {
  margin-top: 20px;
}

.form-container h3 {
  margin-top: 0;
}

.form-container input {
  margin-right: 10px;
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
  .select-container {
    flex-direction: column;
    align-items: flex-start;
  }
  .select-container select {
    margin-right: 0;
    margin-bottom: 10px;
  }
  table {
    font-size: 12px;
  }
}
</style>
