/**
 * Get historical data from the telemetry API
 */
async function getTelemetryData(keys, startTs, endTs, limit = 1000, interval = 0) {
  try {
    const url = `api/getdata`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add any required authentication headers here
      }
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error getting telemetry data:', error);
    return null;
  }
}

/**
 * Process time-series data into monthly sums for the last 12 months
 */
function processMonthlyData(timeSeriesData) {
  const now = new Date();
  const monthlyData = {};
  
  // Initialize last 12 months
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[monthKey] = {
      monthName: date.toLocaleString('pt-PT', { month: 'short' }),
      sum: 0,
      count: 0
    };
  }
  
  // Process each data point
  timeSeriesData.forEach(item => {
    const date = new Date(item.ts);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (monthlyData[monthKey]) {
      const value = parseFloat(item.value) || 0;
      monthlyData[monthKey].sum += value;
      monthlyData[monthKey].count++;
    }
  });
  
  // Prepare result in chronological order
  const result = {
    labels: [],
    values: []
  };
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const month = monthlyData[monthKey];
    
    result.labels.push(month.monthName);
    result.values.push(month.sum); // Using sum instead of average
  }
  
  return result;
}

/**
 * Get current data
 */
async function getCurrentData() {
  try {
    const now = new Date();
    const endTs = now.getTime();
    const startTs = endTs - (24 * 60 * 60 * 1000); // Last 24 hours
    
    const keys = 'co2evitadototal,co2equivalente,energiasolartotal,producaoinstantaneo,consumoinstantaneo,co2emitido,co2evitado,fontesenergiarede,fontesenergiarsolar,energiasolarconsumida,energiaredeconsumida,temperatura,humidade';
    
    const data = await getTelemetryData(keys, startTs, endTs, 100);
    return data;
  } catch (error) {
    console.error('Error getting current data:', error);
    return null;
  }
}

/**
 * Refresh all data
 */
async function refreshData() {
  try {
    // Current data
    const currentData = await getCurrentData();
    if (currentData) {
      updateCurrentValues(currentData);
      
      // Update energy source chart
      if (currentData.fontesenergiarede && currentData.fontesenergiarsolar) {
        updateEnergySourceChart(
          parseFloat(currentData.fontesenergiarsolar[0].value),
          parseFloat(currentData.fontesenergiarede[0].value)
        );
      }
    }
    
    // Historical data for charts - last 12 months
    const now = new Date();
    const endTs = now.getTime();
    const startTs = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).getTime();
    
    // Get all needed historical metrics at once
    const keys = 'energiasolartotal,energiaredeconsumida,co2evitado,co2emitido';
    const historicalData = await getTelemetryData(keys, startTs, endTs, 1000);
    
    if (historicalData) {
      updateChartsWithHistoricalData(historicalData);
    }
  } catch (error) {
    console.error('refreshData error:', error);
  }
}

/**
 * Update current values display
 */
function updateCurrentValues(data) {
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
}

/**
 * Update charts with historical data
 */
function updateChartsWithHistoricalData(data) {
  // Process data for each metric
  const energiaSolar = processMonthlyData(data.energiasolartotal || []);
  const energiaRede = processMonthlyData(data.energiaredeconsumida || []);
  const co2Evitado = processMonthlyData(data.co2evitado || []);
  const co2Emitido = processMonthlyData(data.co2emitido || []);
  
  // Update CO2 chart
  updateCO2Chart(
    co2Evitado.labels,
    co2Evitado.values,
    co2Emitido.values
  );
  
  // Update Energy chart
  updateEnergiaChart(
    energiaSolar.labels,
    energiaSolar.values,
    energiaRede.values
  );
}

// Initialize
refreshData();