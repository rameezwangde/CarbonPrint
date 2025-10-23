# CSV Upload Guide for Carbon FootPrint Dashboard

## 📁 How to Upload CSV Files

### Method 1: Drag & Drop Upload (Recommended)
1. **Navigate to Dashboard**: Go to `/dashboard` in your application
2. **Drag & Drop**: Simply drag your CSV file onto the upload area
3. **Automatic Processing**: The file will be automatically parsed and loaded

### Method 2: File Browser Upload
1. **Click "browse files"** in the upload area
2. **Select your CSV file** from your computer
3. **File will be processed** automatically

### Method 3: Place CSV in Public Folder
1. **Add your CSV file** to the `public/` folder
2. **Name it**: `Carbon_Emission.csv` (or any name you prefer)
3. **Access via URL**: `http://localhost:8080/Carbon_Emission.csv`

### Method 4: Use Sample Data
1. **Click "Use Sample Data"** button
2. **Pre-loaded data** will be available immediately

## 📋 Required CSV Format

Your CSV file must have these columns:

```csv
area,total_CO2,avg_CO2,benchmark,target
North America,15000,12.5,10.0,8.0
Europe,12000,9.8,10.0,7.5
Asia,25000,15.2,10.0,12.0
```

### Column Descriptions:
- **area**: Region or area name (text)
- **total_CO2**: Total CO₂ emissions (numeric)
- **avg_CO2**: Average CO₂ per unit (numeric)
- **benchmark**: Benchmark value (numeric)
- **target**: Target value (numeric, optional)

## 🔧 Technical Implementation

### Data Context
- **File**: `src/contexts/DataContext.tsx`
- **Purpose**: Global state management for emission data
- **Features**: Upload, validation, error handling

### CSV Upload Component
- **File**: `src/components/CSVUpload.tsx`
- **Features**: Drag & drop, file validation, progress indicators

### CSV Utilities
- **File**: `src/utils/csvUtils.ts`
- **Functions**: 
  - `loadCSVFromPublic()` - Load from public folder
  - `downloadCSV()` - Export data as CSV
  - `validateCSVData()` - Validate CSV format

## 🚀 Usage Examples

### 1. Upload via Component
```tsx
import { useDataContext } from '../contexts/DataContext';

const MyComponent = () => {
  const { uploadCSV, emissionData, loading } = useDataContext();
  
  const handleFile = async (file: File) => {
    await uploadCSV(file);
  };
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      {emissionData.map(area => (
        <div key={area.area}>{area.area}: {area.total_CO2}</div>
      ))}
    </div>
  );
};
```

### 2. Load from Public Folder
```tsx
import { loadCSVFromPublic } from '../utils/csvUtils';

const loadData = async () => {
  try {
    const data = await loadCSVFromPublic('Carbon_Emission.csv');
    console.log('Loaded data:', data);
  } catch (error) {
    console.error('Error loading CSV:', error);
  }
};
```

### 3. Download Data as CSV
```tsx
import { downloadCSV } from '../utils/csvUtils';

const exportData = () => {
  downloadCSV(emissionData, 'my_emission_data.csv');
};
```

## 🛠️ File Structure

```
project/
├── public/
│   └── Carbon_Emission.csv          # Sample CSV file
├── src/
│   ├── contexts/
│   │   └── DataContext.tsx          # Global data state
│   ├── components/
│   │   └── CSVUpload.tsx            # Upload component
│   └── utils/
│       └── csvUtils.ts              # CSV utilities
```

## ✅ Validation Rules

1. **Required Fields**: area, total_CO2, avg_CO2, benchmark
2. **Numeric Fields**: total_CO2, avg_CO2, benchmark, target must be numbers
3. **Empty Rows**: Automatically skipped
4. **File Size**: Up to 10MB supported
5. **File Type**: Only .csv files accepted

## 🐛 Error Handling

- **Invalid Format**: Shows error message with details
- **Missing Fields**: Highlights which fields are missing
- **File Type**: Only CSV files are accepted
- **Network Errors**: Handles fetch failures gracefully

## 🎨 UI Features

- **Drag & Drop**: Visual feedback during drag operations
- **Progress Indicators**: Loading states during processing
- **Error Messages**: Clear error reporting
- **File Preview**: Shows uploaded file details
- **Sample Data**: Quick start with pre-loaded data

## 📱 Responsive Design

- **Mobile Friendly**: Works on all screen sizes
- **Touch Support**: Drag & drop works on touch devices
- **Accessibility**: Keyboard navigation supported
