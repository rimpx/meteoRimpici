<template>
  <div class="container">
    <h1>Temperature and Precipitation Per Region</h1>
    <div>
      <h3>Temperatura Per Regione</h3>
      <table v-if="regioni.length">
        <thead>
          <tr>
            <th>Regione</th>
            <th>Temperatura Media (°C)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in regioni" :key="index">
            <td>{{ item.regione }}</td>
            <td>{{ calculateAverage(item.temps) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Bar Chart for Average Temperatures -->
      <apexchart type="bar" :options="chartOptions" :series="chartSeries" height="350">
      </apexchart>
    </div>

    <div>
      <h3>Precipitazioni Per Regione</h3>
      <table v-if="regioni.length">
        <thead>
          <tr>
            <th>Regione</th>
            <th>Precipitazioni Medie (mm)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in regioni" :key="index">
            <td>{{ item.regione }}</td>
            <td>{{ calculateAverage(item.precips) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Bar Chart for Average Precipitations -->
      <apexchart type="bar" :options="precChartOptions" :series="precChartSeries" height="350">
      </apexchart>
    </div>
  </div>
</template>

<script>
import VueApexCharts from 'vue3-apexcharts';

export default {
  name: 'ItalianRegionsChart',
  components: {
    apexchart: VueApexCharts
  },
  data() {
    return {
      temps: [],
      precips: [],
      chartOptions: {
        chart: {
          height: 350,
          type: 'bar'
        },
        plotOptions: {
          bar: {
            horizontal: false
          }
        },
        dataLabels: {
          enabled: false
        },
        xaxis: {
          categories: []
        },
        yaxis: {
          title: {
            text: 'Temperatura (°C)'
          }
        }
      },
      chartSeries: [{
        name: 'Temperatura Media',
        data: []
      }],
      precChartOptions: {
        chart: {
          height: 350,
          type: 'bar'
        },
        plotOptions: {
          bar: {
            horizontal: false
          }
        },
        dataLabels: {
          enabled: false
        },
        xaxis: {
          categories: []
        },
        yaxis: {
          title: {
            text: 'Precipitazioni (mm)'
          }
        }
      },
      precChartSeries: [{
        name: 'Precipitazioni Medie',
        data: []
      }],
      jsonRegioni: {
        "Lombardia": ["Milano", "Bergamo", "Brescia", "Como", "Pavia", "Sondrio"],
        "Lazio": ["Roma", "Latina", "Frosinone", "Viterbo", "Rieti"],
        "Campania": ["Napoli", "Salerno", "Caserta", "Benevento", "Avellino"],
        "Sicilia": ["Palermo", "Catania", "Messina", "Siracusa", "Trapani"],
        "Veneto": ["Venezia", "Verona", "Padova", "Vicenza", "Treviso", "Belluno"],
        "Piemonte": ["Torino", "Novara", "Cuneo", "Asti", "Alessandria", "Biella"],
        "Toscana": ["Firenze", "Pisa", "Siena", "Lucca", "Arezzo", "Grosseto"],
        "Emilia-Romagna": ["Bologna", "Modena", "Parma", "Reggio Emilia", "Ferrara", "Ravenna"],
        "Puglia": ["Bari", "Taranto", "Foggia", "Lecce", "Brindisi", "Barletta"],
        "Calabria": ["Reggio Calabria", "Catanzaro", "Cosenza", "Crotone", "Vibo Valentia"],
        "Liguria": ["Genova", "La Spezia", "Savona", "Imperia"],
        "Marche": ["Ancona", "Pesaro", "Macerata", "Ascoli Piceno", "Fermo"],
        "Abruzzo": ["L'Aquila", "Pescara", "Teramo", "Chieti"],
        "Friuli-Venezia Giulia": ["Trieste", "Udine", "Gorizia", "Pordenone"],
        "Trentino-Alto Adige": ["Trento", "Bolzano"],
        "Umbria": ["Perugia", "Terni"],
        "Basilicata": ["Potenza", "Matera"],
        "Sardegna": ["Cagliari", "Sassari", "Olbia", "Oristano", "Nuoro"],
        "Valle d'Aosta": ["Aosta"],
        "Molise": ["Campobasso", "Isernia"]
      },
      regioni: []
    };
  },
  mounted() {
    for (const region in this.jsonRegioni) {
      var array = [];
      this.jsonRegioni[region].forEach(città => {
        array.push(città);
      });
      this.regioni.push({ regione: region, città: array, temps: [], precips: [] });
    }
    this.loadData();
  },
  methods: {
    loadData() {
      const storedTemps = localStorage.getItem('temperatureData');
      if (storedTemps) {
        this.temps = JSON.parse(storedTemps).tableData;
      }

      const storedPrecs = localStorage.getItem('precipitationData');
      if (storedPrecs) {
        this.precips = JSON.parse(storedPrecs).tableData;
      }

      this.temps.forEach(datoCittà => {
        this.regioni.forEach(regione => {
          regione.città.forEach(città => {
            if (città === datoCittà.Comune) {
              regione.temps.push(...Object.values(datoCittà).filter(value => !isNaN(value) && value !== 'Comune'));
            }
          });
        });
      });

      this.precips.forEach(datoCittà => {
        this.regioni.forEach(regione => {
          regione.città.forEach(città => {
            if (città === datoCittà.Comune) {
              regione.precips.push(...Object.values(datoCittà).filter(value => !isNaN(value) && value !== 'Comune'));
            }
          });
        });
      });

      this.mostraTemperatureData(this.regioni);
      this.mostraPrecipitazioni(this.regioni);
    },
    calculateAverage(data) {
      return data.length ? (data.reduce((a, b) => a + b, 0) / data.length).toFixed(2) : 0;
    },
    mostraTemperatureData(data) {
      if (data.length > 1) {
        // Update chart data
        this.chartOptions.xaxis.categories = data.map(item => item.regione);
        this.chartSeries[0].data = data.map(item => this.calculateAverage(item.temps));
      }
    },
    mostraPrecipitazioni(data) {
      if (data.length > 1) {
        // Update chart data
        this.precChartOptions.xaxis.categories = data.map(item => item.regione);
        this.precChartSeries[0].data = data.map(item => this.calculateAverage(item.precips));
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

table {
  border-collapse: collapse;
  width: 100%;
  margin-top: 20px;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f4f4f4;
}

h3 {
  margin-top: 20px;
}
</style>
