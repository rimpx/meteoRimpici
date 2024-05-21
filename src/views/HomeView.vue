<template>
  <div>
    <apex-chart type="bar" :options="chartOptions" :series="series"></apex-chart>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';
import dataFile from '@/assets/Tavole-Dati-Meteoclimatici-Anno-2021.xlsx';

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
    this.readExcel();
  },
  methods: {
    readExcel() {
      const workbook = XLSX.read(dataFile, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      this.processData(json);
    },
    processData(data) {
      const categories = data.map(item => item.Categoria);
      const values = data.map(item => item.Valore);
      this.series = [{ name: 'Valore', data: values }];
      this.chartOptions.xaxis.categories = categories;
    }
  }
};
</script>

