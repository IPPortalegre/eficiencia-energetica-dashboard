/**
 * Get data from API
 */
async function getData() {
  try {
    const url = '/api/getdata'
 
    const response = await fetch(`${url}`, {
      method: 'GET'
    });
 
    // vê se a resposta é ok
    // se não for dá um erro
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
            if (key === "temperatura") {
              const tempValue = parseFloat(data[key][0].value.replace(",", "."));
              targetElement.textContent = isNaN(tempValue) ? "-" : Math.round(tempValue);
            } else if (key === "co2equivalente") {
              const co2Value = parseFloat(data[key][0].value);
              targetElement.textContent = isNaN(co2Value) ? "-" : co2Value.toFixed(0);
            } else if (key === "co2evitadototal") {
              const co2Saved = parseFloat(data[key][0].value);
              targetElement.textContent = isNaN(co2Saved) ? "-" : co2Saved.toFixed(2);
            } else {
              targetElement.textContent = data[key][0].value;
            }
          }
        }
      }

      // Atualizar o gráfico de fontes de energia se os dados existirem
      if (data.fontesenergiarede && data.fontesenergiarsolar) {
        updateEnergySourceChart(
          parseFloat(data.fontesenergiarsolar[0].value),
          parseFloat(data.fontesenergiarede[0].value)
              );
           }
         }
        } catch (error) {
        console.error('refreshData error:', error);
          }
      }
    


refreshData();