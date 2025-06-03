/**
 * Get data from API
 */
async function getData() {
  try {
    const url = '/api/getdata'
 
    const response = await fetch(`${url}`, {
      method: 'GET'
    });
 
    // Checa se a resposta é ok
    // Se não for dá um erro
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    alert(error);
    console.error('Error getting data:', error);
    return null;
  }
}

/**
 * Refresh data
 */
async function refreshData() {
  try {
    const data = await getData();
    if (data) {
      // Itera sobre as chaves do objeto data
      // e atualiza os elementos do HTML
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const targetElement = document.getElementById(key);
          if (targetElement) {
            if (key === "tempEx") {
              const tempValue = parseFloat(data[key][0].value.replace(",", "."));
              targetElement.textContent = isNaN(tempValue) ? "-" : Math.round(tempValue);
            } else if (key === "co2equivalente") {
              const co2Value = parseFloat(data[key][0].value);
              targetElement.textContent = isNaN(co2Value) ? "-" : co2Value.toFixed(0);
            }else if (key === "co2evitadototal") {
              const co2Saved = parseFloat(data[key][0].value);
              targetElement.textContent = isNaN(co2Saved) ? "-" : co2Saved.toFixed(2);
            }
             else {
              targetElement.textContent = data[key][0].value;
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('refreshData error:', error);
  }
}

function updateEnergiaChartWithAPIValue() {
  getData().then(data => {
    if (data && data["deltaEa+Total"]) {
      const valor = data["deltaEa+Total"][0].value;
      if (energiaChart) {
        energiaChart.data.datasets[0].data[0] = valor;
        energiaChart.update();
      }
    }
  }).catch(err => {
    console.error('Erro ao buscar dados de energia:', err);
  });
}
function updateCO2ChartWithAPIValue() {
  getData().then(data => {
    if (data && data["_ECD_co2save"]) {
      const valor = data["_ECD_co2save"][0].value;
      if (energiaChart) {
        energiaChart.data.datasets[0].data[0] = valor;
        energiaChart.update();
      }
    }
  }).catch(err => {
    console.error('Erro ao buscar dados de C02:', err);
  });
}

// Run this after the chart is created
setTimeout(updateEnergiaChartWithAPIValue, 500); // or call when data is ready

refreshData();


