<template>
  <div>
    <input type="file" @change="readExcel" />
    <apexchart type="bar" :options="chartOptions" :series="series"></apexchart>
  </div>
</template>

<script>
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
  methods: {
    readExcel(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        this.processData(json);
      };
      reader.readAsBinaryString(file);
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
