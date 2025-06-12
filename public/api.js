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
 * Process time-series data to get latest value for each month
 */
function processMonthlyData(data, debugKey = '') {
  if (!Array.isArray(data)) {
    console.warn(`Invalid data received for ${debugKey}`);
    return { labels: [], values: Array(12).fill(0) };
  }

  const now = new Date();
  const monthlyData = new Map();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Initialize last 12 months
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentYear, currentMonth - i, 1);
    const monthKey = date.toLocaleString('pt-PT', { month: 'short' });
    monthlyData.set(monthKey, {
      value: 0,
      timestamp: 0
    });
  }

  // Process data points
  data.forEach(item => {
    try {
      if (!item || !item.ts) return;
      
      const timestamp = parseInt(item.ts);
      const date = new Date(timestamp);
      
      // Skip future dates
      if (date > now) return;
      
      const monthKey = date.toLocaleString('pt-PT', { month: 'short' });
      
      if (monthlyData.has(monthKey)) {
        const value = parseFloat(String(item.value).replace(',', '.'));
        if (!isNaN(value)) {
          monthlyData.set(monthKey, {
            value,
            timestamp
          });
        }
      }
    } catch (e) {
      console.warn('Error processing item:', e);
    }
  });

  // Prepare chronological result
  const result = {
    labels: [],
    values: []
  };

  // Generate sorted month labels (oldest first)
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - i, 1);
    const monthKey = date.toLocaleString('pt-PT', { month: 'short' });
    result.labels.push(monthKey);
    result.values.push(monthlyData.get(monthKey).value);
  }

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