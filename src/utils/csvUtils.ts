import Papa from 'papaparse';

export interface CarbonEmissionData {
  area: string;
  total_CO2: number;
  avg_CO2: number;
  benchmark: number;
  target?: number;
}

export const loadCSVFromPublic = async (filename: string): Promise<CarbonEmissionData[]> => {
  try {
    const response = await fetch(`/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}`);
    }
    
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedData = results.data as any[];
          
          // Clean and validate data
          const cleanedData: CarbonEmissionData[] = parsedData
            .filter(row => row.area && row.area.trim() !== '')
            .map(row => ({
              area: row.area?.trim() || '',
              total_CO2: parseFloat(row.total_CO2) || 0,
              avg_CO2: parseFloat(row.avg_CO2) || 0,
              benchmark: parseFloat(row.benchmark) || 0,
              target: row.target ? parseFloat(row.target) : undefined,
            }));

          resolve(cleanedData);
        },
        error: (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        }
      });
    });
  } catch (error) {
    throw new Error(`Failed to load CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const downloadCSV = (data: CarbonEmissionData[], filename: string = 'carbon_emission_data.csv') => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const validateCSVData = (data: any[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!Array.isArray(data) || data.length === 0) {
    errors.push('No data found in CSV file');
    return { isValid: false, errors };
  }

  const requiredFields = ['area', 'total_CO2', 'avg_CO2', 'benchmark'];
  
  data.forEach((row, index) => {
    requiredFields.forEach(field => {
      if (!(field in row) || row[field] === '' || row[field] === null || row[field] === undefined) {
        errors.push(`Row ${index + 1}: Missing required field '${field}'`);
      }
    });

    // Validate numeric fields
    const numericFields = ['total_CO2', 'avg_CO2', 'benchmark'];
    numericFields.forEach(field => {
      if (row[field] && isNaN(parseFloat(row[field]))) {
        errors.push(`Row ${index + 1}: Field '${field}' must be numeric`);
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};
