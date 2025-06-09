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
// In your getHistory function
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
 * Process time-series data into monthly sums for the last 12 months
 */
function processMonthlyData(data, debugKey = '') {
  if (!Array.isArray(data)) {
    console.warn(`Invalid data received for ${debugKey}`);
    return { labels: [], values: Array(12).fill(0) };
  }

  const now = new Date();
  const monthlyData = {};

  // Initialize last 12 months with proper date objects
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    
    monthlyData[monthKey] = {
      monthName: date.toLocaleString('pt-PT', { month: 'short' }),
      sum: 0
    };
  }

  // Process each data point
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

  Object.keys(monthlyData)
    .sort((a, b) => new Date(a) - new Date(b))
    .forEach(monthKey => {
      result.labels.push(monthlyData[monthKey].monthName);
      result.values.push(monthlyData[monthKey].sum);
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

// Initialize
refreshData();