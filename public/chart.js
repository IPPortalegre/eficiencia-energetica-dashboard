
//gráfico fonte de energia
      function createEnergySourceChart(solarValue, redeValue) {
        const ctx = document.getElementById('ensource-chart').getContext('2d');
        
        const total = solarValue + redeValue;
        const solarPercent = Math.round((solarValue / total) * 100);
        const redePercent = Math.round((redeValue / total) * 100);

        energySourceChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Fontes de Energia'],
            datasets: [
              {
                label: 'Solar',
                data: [solarPercent],
                backgroundColor: 'rgba(8,158,84,255)',
                borderRadius: 14,
                borderSkipped: false,
                barThickness: 40
              },
              {
                label: 'Rede',
                data: [redePercent],
                backgroundColor: '#eb9e0a',
                borderRadius: 14,
                borderSkipped: false,
                barThickness: 40
              }
            ]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            onResize: function(chart) {
              // This will force a redraw when the chart resizes
              chart.update();
            },
            plugins: {
              legend: {
                display: true,
                position: 'bottom',
                align: 'center',
                maxHeight: 40,
                padding: 10,
                labels: {
                  font: {
                    size: 16
                  },
                  usePointStyle: true,
                  pointStyle: 'rectRounded'
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const value = context.raw;
                    return `${context.dataset.label}: ${value}%`;
                  }
                }
              }
            },
            scales: {
              x: {
                min: 0,
                max: 100,
                title: { display: false },             
                grid: { display: false }
              },
              y: {
                display: false,
                grid: { display: false }
              }
            }
          }
        });
      }
      let energySourceChart;

      function updateEnergySourceChart(solarValue, redeValue) {
        if (!energySourceChart) {
          createEnergySourceChart();
        }

        // calcula porcentagens
        const total = solarValue + redeValue;
        const solarPercent = Math.round((solarValue / total) * 100);
        const redePercent = Math.round((redeValue / total) * 100);

        // atualiza os dados do gráfico
        energySourceChart.data.datasets[0].data = [solarPercent];
        energySourceChart.data.datasets[1].data = [redePercent];
        energySourceChart.update();
      }

    // Update your chart initialization in index.html
      let co2Chart, energiaChart;     

      async function createCO2Chart() {
        
        const endTs = new Date(new Date().getFullYear(), new Date().getMonth() + 1 , 0, 23, 59, 59, 999).getTime();
        const startTs = new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1).getTime();

        try {
          const [avoidedData, emittedData] = await Promise.all([
            getHistory('co2evitado', startTs, endTs),
            getHistory('co2emitido', startTs, endTs)
          ]);

          const avoided = processMonthlyData(avoidedData, 'co2evitado');
          const emitted = processMonthlyData(emittedData, 'co2emitido');

          const ctx = document.getElementById('chart-co2').getContext('2d');
          
          if (co2Chart) {
            co2Chart.data.labels = avoided.labels;
            co2Chart.data.datasets[0].data = avoided.values;
            co2Chart.data.datasets[1].data = emitted.values;
            co2Chart.update();
          } else {
            co2Chart = new Chart(ctx, {
              type: 'bar',
              data: {
                labels: avoided.labels,
                datasets: [
                  {
                    label: 'CO₂ Evitado (ton)',
                    data: avoided.values, 
                    backgroundColor: '#98F381FF',
                    borderColor: '#5DCC41FF',
                    borderWidth: 1
                  },
                  {
                    label: 'CO₂ Emitido (ton)',
                    data: emitted.values, 
                    backgroundColor: 'rgba(248,109,34,255)',
                    borderColor: 'rgba(248,109,34,255)',
                    borderWidth: 1
                  }
                ]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom',
                    labels: {
                      font: {
                        size: 16
                      },
                      usePointStyle: true,
                      pointStyle: 'rectRounded'
                    }
                  },
                  tooltip: {
                    mode: 'index',
                    intersect: false
                  }
                },
                scales: {
                  x: { 
                    stacked: true,
                    grid: { display: false }  
                  },
                  y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Toneladas' },
                    grid: { display: false }  
                  }

                }
              }
            });
          }
        } catch (error) {
          console.error('Error creating CO2 chart:', error);
        }
      }

      

      async function createEnergiaChart() {


        const endTs = new Date(new Date().getFullYear(), new Date().getMonth() + 1 , 0, 23, 59, 59, 999).getTime();
        const startTs = new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1).getTime();
       

        try {
          const [producedData, consumedData] = await Promise.all([
            getHistory('energiasolarconsumida', startTs, endTs),
            getHistory('energiaredeconsumida', startTs, endTs)
          ]);

          const produced = processMonthlyData(producedData, 'energiasolarconsumida');
          const consumed = processMonthlyData(consumedData, 'energiaredeconsumida');

          const ctx = document.getElementById('chart-energia').getContext('2d');
          
          if (energiaChart) {
            energiaChart.data.labels = produced.labels;
            energiaChart.data.datasets[0].data = produced.values;
            energiaChart.data.datasets[1].data = consumed.values;
            energiaChart.update();
          } else {
            energiaChart = new Chart(ctx, {
              type: 'bar',
              data: {
                labels: produced.labels,
                datasets: [
                  {
                    label: 'Energia Solar (kWh)',
                    data: produced.values,
                    backgroundColor: 'rgba(8,158,84,255)',
                    borderColor: 'rgba(8,158,84,255)',
                    borderWidth: 1
                  },
                  {
                    label: 'Energia Rede (kWh)',
                    data: consumed.values,
                    backgroundColor: 'rgba(235,158,10,255)',
                    borderColor: 'rgba(235,158,10,255)',
                    borderWidth: 1
                  }
                ]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom',
                    labels: {
                      font: {
                        size: 16
                      },
                      usePointStyle: true,
                      pointStyle: 'rectRounded'
                    }
                   },
                  tooltip: {
                    mode: 'index',
                    intersect: false
                  }
                },
                scales: {
                  x: { 
                    stacked: true,
                    grid: { display: false }  
                  },
                  y: {
                    stacked: true,
                    beginAtZero: true,
                    title: { display: true, text: 'kWh' },
                    grid: { display: false }  
                  }
                }
              }
            });
          }
        } catch (error) {
          console.error('Error creating Energy chart:', error);
        }
      }

      


document.addEventListener("DOMContentLoaded", async () => {
  const date = moment();
  const currentDate = date.format('D/MM/YYYY');
  document.getElementById("currentDate").textContent = currentDate;

  await createCO2Chart();
  await createEnergiaChart();
});


