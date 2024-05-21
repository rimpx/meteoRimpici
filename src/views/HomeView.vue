<template>
  <div>
    <apex-chart type="bar" :options="chartOptions" :series="series"></apex-chart>
  </div>
</template>

<script>
// Importazione delle librerie necessarie
import * as XLSX from 'xlsx';

export default {
  data() {
    return {
      series: [],
      chartOptions: {
        chart: {
          type: 'bar',
        },
        xaxis: {
          categories: []
        }
      }
    };
  },
  mounted() {
    this.loadAndProcessData();
  },
  methods: {
    loadAndProcessData() {
      // Qui il tuo codice per leggere il file Excel e processare i dati
      // Simile a quello che hai usato prima
    }
  }
};
</script>


