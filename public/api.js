/**
 * Get data from API
 */
async function getData() {
  try {
    const url = '/api/getdata';
    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error getting data:', error);
    return null;
  }
}



/**
 * Get historical data from API
 */

async function getHistory(key, startTs, endTs) {
  try {
    const url = `/api/gethistory?key=${encodeURIComponent(key)}&startTs=${startTs}&endTs=${endTs}`;
    console.log('Fetching history:', url);
    
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const data = await response.json();
    console.log(`Received data for ${key}:`, data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
}


/**
 * Process time-series data 
 */
function processMonthlyData(data, debugKey = '') {
  if (!Array.isArray(data)) {
    console.warn(`Invalid data received for ${debugKey}`);
    return { labels: [], values: Array(12).fill(0) };
  }

  const now = new Date();
  const monthlyData = {};
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Inicializar os dados mensais dos ultimos 12 meses
  for (let i = 0; i < 12; i++) {
    const monthOffset = i;
    const date = new Date(currentYear, currentMonth - monthOffset, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    monthlyData[monthKey] = {
      monthName: date.toLocaleString('pt-PT', { month: 'short' }),
      sum: 0,
      year: date.getFullYear(),
      month: date.getMonth()
    };
  }

  // Processa cada data point
  data.forEach(item => {
    try {
      if (!item || !item.ts || item.value === undefined) {
        console.warn('Invalid data point:', item);
        return;
      }

      const timestamp = typeof item.ts === 'string' ? parseInt(item.ts) : item.ts;
      const date = new Date(timestamp);

      if (isNaN(date.getTime())) {
        console.warn('Invalid timestamp:', item.ts);
        return;
      }

    

      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyData[monthKey]) {
        const value = parseFloat(String(item.value).replace(',', '.'));
        monthlyData[monthKey].sum += isNaN(value) ? 0 : value;
      }
    } catch (e) {
      console.warn('Error processing item:', item, e);
    }
  });

  // Prepare result in chronological order
  const result = {
    labels: [],
    values: []
  };

  // Sort by year and month in ascending order
  const sortedMonths = Object.values(monthlyData).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  sortedMonths.forEach(month => {
    result.labels.push(month.monthName);
    result.values.push(month.sum);
  });

 
  console.log(`Processed monthly data for ${debugKey}:`, result);
  
  return result;
}

/**
 * Refresh data
 */
async function refreshData() {
  try {
    const data = await getData();
    if (data) {
      // Update current values
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

      // Update energy source chart
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

function checkForChartErrors() {
  let hasErrors = false;
  
  // Check CO2 chart
  if (!co2Chart || co2Chart.data.labels.length === 0 || co2Chart.data.datasets.some(d => d.data.length === 0)) {
    console.error('CO2 chart has errors or missing data');
    hasErrors = true;
  }
  
  // Check Energy chart
  if (!energiaChart || energiaChart.data.labels.length === 0 || energiaChart.data.datasets.some(d => d.data.length === 0)) {
    console.error('Energy chart has errors or missing data');
    hasErrors = true;
  }
  
  // Check Energy Source chart
  if (!energySourceChart || energySourceChart.data.datasets.some(d => d.data.length === 0)) {
    console.error('Energy source chart has errors or missing data');
    hasErrors = true;
  }
  
  if (hasErrors) {
    console.log('Reloading page due to chart errors...');
    setTimeout(() => {
      window.location.reload();
    }, 5000); // Reload after 5 seconds
  }
}

// Initialize
refreshData();