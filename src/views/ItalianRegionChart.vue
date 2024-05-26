<template>
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
  
      <!-- Bar Chart for Temperatures -->
      <apexchart type="bar" :options="chartOptions" :series="chartSeries" height="350"></apexchart>
  
      <h3>Precipitazioni Per Regione</h3>
      <table v-if="regioni.length">
        <thead>
          <tr>
            <th>Regione</th>
            <th>Precipitazioni Medie</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in regioni" :key="index">
            <td>{{ item.regione }}</td>
            <td>{{ calculateAverage(item.precips) }}</td>
          </tr>
        </tbody>
      </table>
  
      <!-- Bar Chart for Precipitations -->
      <apexchart type="bar" :options="precChartOptions" :series="precChartSeries" height="350"></apexchart>
    </div>
  </template>
  <script>
  import VueApexCharts from 'vue3-apexcharts';
  
  export default {
    name: 'ClassificaView',
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
              text: 'Precipitazioni'
            }
          }
        },
        precChartSeries: [{
          name: 'Precipitazioni',
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
      this.initializeRegions();
      this.loadData();
    },
    methods: {
      initializeRegions() {
        for (const region in this.jsonRegioni) {
          this.regioni.push({ regione: region, temps: [], precips: [] });
        }
      },
      loadData() {
        const storedTemps = JSON.parse(localStorage.getItem('temperatureData') || '[]');
        const storedPrecs = JSON.parse(localStorage.getItem('precipitationData') || '[]');
  
        if (Array.isArray(storedTemps)) {
          storedTemps.forEach(datiCittà => {
            const comune = datiCittà.Comune;
            const tempData = Object.keys(datiCittà)
              .filter(key => key.startsWith('Temp_'))
              .map(key => parseFloat(datiCittà[key]));
  
            this.regioni.forEach(region => {
              if (this.jsonRegioni[region.regione].includes(comune)) {
                region.temps.push(...tempData);
              }
            });
          });
        } else {
          console.error('Temperature data is not an array:', storedTemps);
        }
  
        if (Array.isArray(storedPrecs)) {
          storedPrecs.forEach(datiCittà => {
            const comune = datiCittà.Comune;
            const precData = Object.keys(datiCittà)
              .filter(key => key.startsWith('Prec_'))
              .map(key => parseFloat(datiCittà[key]));
  
            this.regioni.forEach(region => {
              if (this.jsonRegioni[region.regione].includes(comune)) {
                region.precips.push(...precData);
              }
            });
          });
        } else {
          console.error('Precipitation data is not an array:', storedPrecs);
        }
  
        this.updateChartAndTable();
        this.updatePrecipitationChartAndTable();
      },
      calculateAverage(values) {
        if (values.length === 0) return '-';
        const sum = values.reduce((a, b) => a + b, 0);
        return (sum / values.length).toFixed(2);
      },
      updateChartAndTable() {
        this.chartOptions.xaxis.categories = this.regioni.map(item => item.regione);
        this.chartSeries[0].data = this.regioni.map(item => parseFloat(this.calculateAverage(item.temps)));
      },
      updatePrecipitationChartAndTable() {
        this.precChartOptions.xaxis.categories = this.regioni.map(item => item.regione);
        this.precChartSeries[0].data = this.regioni.map(item => parseFloat(this.calculateAverage(item.precips)));
      }
    }
  };
  </script>
  <style scoped>
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
  </style>
  