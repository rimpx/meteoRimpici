<template>
  <div class="container">
    <h1>Top 10 Hottest Cities Across All Years</h1>
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
            <th>Temperature</th>
            <th>Year</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in top10TableData" :key="index">
            <td>{{ row.Comune }}</td>
            <td>{{ row.MaxTemp }}</td>
            <td>{{ row.Year }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import ApexCharts from 'vue3-apexcharts'

export default {
  components: {
    apexchart: ApexCharts,
  },
  data() {
    return {
      series: [],
      tableData: [],
      top10TableData: [],
      years: [],
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
          text: 'Highest Recorded Temperatures by City',
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
    this.loadFromLocalStorage();
    this.adjustChartSize();
    window.addEventListener('resize', this.adjustChartSize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.adjustChartSize);
  },
  methods: {
    loadFromLocalStorage() {
      const storedData = localStorage.getItem('temperatureData');
      if (storedData) {
        const { tableData, years } = JSON.parse(storedData);
        this.tableData = tableData;
        this.years = years;
        this.updateChartData();
      } else {
        console.error("No temperature data found in local storage.");
      }
    },
    updateChartData() {
      const dataWithMaxTemps = this.tableData.map(row => {
        const temps = this.years.map(year => ({
          temperature: parseFloat(row[`Temp_${year}`]) || 0,
          year: year
        }));
        const maxTempData = temps.reduce((max, temp) => temp.temperature > max.temperature ? temp : max, { temperature: -Infinity });
        return {
          Comune: row.Comune,
          MaxTemp: maxTempData.temperature.toFixed(2),
          Year: maxTempData.year
        };
      }).sort((a, b) => b.MaxTemp - a.MaxTemp).slice(0, 10);

      this.top10TableData = dataWithMaxTemps;
      this.series = [{
        name: 'Max Temperature',
        data: dataWithMaxTemps.map(d => parseFloat(d.MaxTemp))
      }];
      this.chartOptions.xaxis.categories = dataWithMaxTemps.map(d => d.Comune);
    },
    adjustChartSize() {
      this.chartHeight = window.innerWidth > 1200 ? '600px' : '400px';
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

