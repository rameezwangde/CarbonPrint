// Power BI Template Generator
// Creates a complete .pbix template with pre-loaded visualizations

export interface PowerBITemplateConfig {
  templateName: string;
  pages: PowerBIPage[];
  theme: PowerBITheme;
  dataModel: PowerBIDataModel;
  relationships: PowerBIRelationship[];
  measures: PowerBIMeasure[];
  slicers: PowerBISlicer[];
  bookmarks: PowerBIBookmark[];
}

export interface PowerBIPage {
  name: string;
  displayName: string;
  visuals: PowerBIVisual[];
  layout: PowerBILayout;
  filters: PowerBIFilter[];
}

export interface PowerBIVisual {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number; width: number; height: number };
  dataFields: { [key: string]: string };
  formatting: { [key: string]: any };
  interactions: PowerBIInteraction[];
}

export interface PowerBITheme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
}

export interface PowerBIDataModel {
  tables: PowerBITable[];
  relationships: PowerBIRelationship[];
}

export interface PowerBITable {
  name: string;
  columns: PowerBIColumn[];
  measures: PowerBIMeasure[];
}

export interface PowerBIColumn {
  name: string;
  dataType: string;
  format?: string;
  isHidden?: boolean;
}

export interface PowerBIMeasure {
  name: string;
  expression: string;
  description: string;
  format?: string;
}

export interface PowerBIRelationship {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  cardinality: string;
}

export interface PowerBISlicer {
  name: string;
  field: string;
  type: string;
  style: string;
  pages: string[];
}

export interface PowerBIBookmark {
  name: string;
  description: string;
  filters: { [key: string]: any };
  layout: { [key: string]: any };
}

export interface PowerBILayout {
  width: number;
  height: number;
  gridSize: number;
  snapToGrid: boolean;
}

export interface PowerBIFilter {
  field: string;
  operator: string;
  value: any;
}

export interface PowerBIInteraction {
  targetVisual: string;
  action: string;
  enabled: boolean;
}

// Generate complete Power BI template
export const generatePowerBITemplate = (userData: any): PowerBITemplateConfig => {
  return {
    templateName: "Carbon Footprint Insights Dashboard",
    pages: generatePages(),
    theme: generateTheme(),
    dataModel: generateDataModel(),
    relationships: generateRelationships(),
    measures: generateMeasures(),
    slicers: generateSlicers(),
    bookmarks: generateBookmarks()
  };
};

// Generate all dashboard pages
const generatePages = (): PowerBIPage[] => {
  return [
    {
      name: "Executive Summary",
      displayName: "Executive Summary",
      layout: { width: 1920, height: 1080, gridSize: 20, snapToGrid: true },
      visuals: [
        // KPI Cards
        {
          id: "kpi_total_co2",
          type: "Card",
          title: "Total CO2 Emissions",
          position: { x: 0, y: 0, width: 300, height: 150 },
          dataFields: { "Values": "[Total CO2]" },
          formatting: {
            fontSize: 24,
            fontColor: "#1F2937",
            backgroundColor: "#F3F4F6",
            borderColor: "#D1D5DB",
            borderWidth: 1
          },
          interactions: []
        },
        {
          id: "kpi_eco_score",
          type: "Gauge",
          title: "Eco Score",
          position: { x: 320, y: 0, width: 300, height: 150 },
          dataFields: { "Values": "[Eco Score]", "Target": "80" },
          formatting: {
            minValue: 0,
            maxValue: 100,
            targetValue: 80,
            colorScheme: "Green"
          },
          interactions: []
        },
        {
          id: "kpi_performance",
          type: "Card",
          title: "Performance Level",
          position: { x: 640, y: 0, width: 300, height: 150 },
          dataFields: { "Values": "[Performance Level]" },
          formatting: {
            conditionalFormatting: {
              "Good": "#10B981",
              "Average": "#F59E0B",
              "Needs Improvement": "#EF4444"
            }
          },
          interactions: []
        },
        {
          id: "kpi_prediction",
          type: "Card",
          title: "Next Month Prediction",
          position: { x: 960, y: 0, width: 300, height: 150 },
          dataFields: { "Values": "[Next Month Prediction]" },
          formatting: {
            showChangeIndicator: true,
            changeColor: "#F59E0B"
          },
          interactions: []
        },
        // Key Insights Table
        {
          id: "insights_table",
          type: "Table",
          title: "Key Insights",
          position: { x: 0, y: 170, width: 1260, height: 200 },
          dataFields: {
            "Columns": "Insights[Type],Insights[Title],Insights[Message],Insights[Priority]"
          },
          formatting: {
            conditionalFormatting: {
              "warning": "#FEF3C7",
              "info": "#DBEAFE",
              "success": "#D1FAE5"
            }
          },
          interactions: []
        }
      ],
      filters: []
    },
    {
      name: "CO2 Breakdown",
      displayName: "CO2 Breakdown",
      layout: { width: 1920, height: 1080, gridSize: 20, snapToGrid: true },
      visuals: [
        // Pie Chart
        {
          id: "pie_co2_breakdown",
          type: "PieChart",
          title: "CO2 Emissions by Category",
          position: { x: 0, y: 0, width: 400, height: 400 },
          dataFields: {
            "Legend": "CO2Breakdown[Category]",
            "Values": "CO2Breakdown[Value]"
          },
          formatting: {
            showDataLabels: true,
            dataLabelStyle: "Percentage",
            colorPalette: "Custom",
            customColors: {
              "Transportation": "#3B82F6",
              "Electricity": "#10B981",
              "LPG/Gas": "#F59E0B",
              "Air Travel": "#EF4444",
              "Meat Consumption": "#8B5CF6",
              "Dining Out": "#06B6D4",
              "Waste": "#84CC16"
            }
          },
          interactions: []
        },
        // Bar Chart
        {
          id: "bar_co2_comparison",
          type: "ClusteredColumnChart",
          title: "Category Comparison",
          position: { x: 420, y: 0, width: 400, height: 400 },
          dataFields: {
            "X-axis": "CO2Breakdown[Category]",
            "Y-axis": "CO2Breakdown[Value]"
          },
          formatting: {
            showDataLabels: true,
            dataLabelStyle: "Value",
            colorScheme: "Category"
          },
          interactions: []
        },
        // Donut Chart
        {
          id: "donut_co2_percentage",
          type: "DonutChart",
          title: "Percentage Breakdown",
          position: { x: 840, y: 0, width: 400, height: 400 },
          dataFields: {
            "Legend": "CO2Breakdown[Category]",
            "Values": "CO2Breakdown[Value]"
          },
          formatting: {
            innerRadius: 50,
            showDataLabels: true,
            dataLabelStyle: "Percentage"
          },
          interactions: []
        },
        // Category Details Table
        {
          id: "table_category_details",
          type: "Table",
          title: "Category Details",
          position: { x: 0, y: 420, width: 1240, height: 200 },
          dataFields: {
            "Columns": "CO2Breakdown[Category],CO2Breakdown[Value],CO2Breakdown[Percentage],CO2Breakdown[Description]"
          },
          formatting: {
            conditionalFormatting: {
              "High": "#FEE2E2",
              "Medium": "#FEF3C7",
              "Low": "#D1FAE5"
            }
          },
          interactions: []
        }
      ],
      filters: []
    },
    {
      name: "Forecast Analysis",
      displayName: "Forecast Analysis",
      layout: { width: 1920, height: 1080, gridSize: 20, snapToGrid: true },
      visuals: [
        // Main Line Chart
        {
          id: "line_forecast",
          type: "LineChart",
          title: "12-Month CO2 Forecast",
          position: { x: 0, y: 0, width: 800, height: 400 },
          dataFields: {
            "X-axis": "ForecastData[Month]",
            "Y-axis": "ForecastData[Current],ForecastData[Predicted]"
          },
          formatting: {
            showMarkers: true,
            lineStyle: {
              "Current": "Solid",
              "Predicted": "Dashed"
            },
            colors: {
              "Current": "#10B981",
              "Predicted": "#F59E0B"
            }
          },
          interactions: []
        },
        // Seasonal Area Chart
        {
          id: "area_seasonal",
          type: "AreaChart",
          title: "Seasonal Trends",
          position: { x: 820, y: 0, width: 400, height: 400 },
          dataFields: {
            "X-axis": "ForecastData[Month]",
            "Y-axis": "ForecastData[Predicted]",
            "Color": "ForecastData[Season]"
          },
          formatting: {
            gradientFill: true,
            colorScheme: "Seasonal"
          },
          interactions: []
        },
        // Seasonal Information Table
        {
          id: "table_seasonal_info",
          type: "Table",
          title: "Seasonal Information",
          position: { x: 0, y: 420, width: 600, height: 200 },
          dataFields: {
            "Columns": "ForecastData[Month],ForecastData[Season],ForecastData[Temperature],ForecastData[Activities]"
          },
          formatting: {
            conditionalFormatting: {
              "Winter": "#EFF6FF",
              "Spring": "#ECFDF5",
              "Summer": "#FFFBEB",
              "Monsoon": "#F3F4F6",
              "Post-Monsoon": "#FEF2F2"
            }
          },
          interactions: []
        },
        // Forecast Summary Cards
        {
          id: "card_peak_month",
          type: "Card",
          title: "Peak Month",
          position: { x: 620, y: 420, width: 200, height: 100 },
          dataFields: { "Values": "[Peak Month]" },
          formatting: {
            fontSize: 16,
            backgroundColor: "#FEF3C7"
          },
          interactions: []
        },
        {
          id: "card_lowest_month",
          type: "Card",
          title: "Lowest Month",
          position: { x: 840, y: 420, width: 200, height: 100 },
          dataFields: { "Values": "[Lowest Month]" },
          formatting: {
            fontSize: 16,
            backgroundColor: "#D1FAE5"
          },
          interactions: []
        }
      ],
      filters: []
    },
    {
      name: "Comparative Analysis",
      displayName: "Comparative Analysis",
      layout: { width: 1920, height: 1080, gridSize: 20, snapToGrid: true },
      visuals: [
        // Peer Comparison Chart
        {
          id: "bar_peer_comparison",
          type: "ClusteredBarChart",
          title: "Peer Comparison",
          position: { x: 0, y: 0, width: 500, height: 400 },
          dataFields: {
            "Y-axis": "PeerComparison[Category]",
            "X-axis": "PeerComparison[UserValue],PeerComparison[AverageValue]"
          },
          formatting: {
            legend: {
              "UserValue": "Your Value",
              "AverageValue": "Average"
            },
            colors: {
              "UserValue": "#3B82F6",
              "AverageValue": "#9CA3AF"
            }
          },
          interactions: []
        },
        // Performance Gauge
        {
          id: "gauge_performance",
          type: "Gauge",
          title: "Performance Percentile",
          position: { x: 520, y: 0, width: 300, height: 400 },
          dataFields: { "Values": "[Performance Percentile]" },
          formatting: {
            minValue: 0,
            maxValue: 100,
            targetValue: 50,
            colorScheme: "Performance"
          },
          interactions: []
        },
        // Insights Table
        {
          id: "table_insights",
          type: "Table",
          title: "Key Insights",
          position: { x: 0, y: 420, width: 820, height: 200 },
          dataFields: {
            "Columns": "Insights[Type],Insights[Title],Insights[Message],Insights[Priority]"
          },
          formatting: {
            conditionalFormatting: {
              "warning": "#FEF3C7",
              "info": "#DBEAFE",
              "success": "#D1FAE5"
            }
          },
          interactions: []
        }
      ],
      filters: []
    },
    {
      name: "Geographic Analysis",
      displayName: "Geographic Analysis",
      layout: { width: 1920, height: 1080, gridSize: 20, snapToGrid: true },
      visuals: [
        // Map Visualization
        {
          id: "map_location",
          type: "Map",
          title: "Location Analysis",
          position: { x: 0, y: 0, width: 500, height: 400 },
          dataFields: {
            "Location": "AreaAnalysis[City]",
            "Size": "AreaAnalysis[Total]",
            "Color": "AreaAnalysis[Total]"
          },
          formatting: {
            colorScheme: "Gradient",
            sizeRange: [10, 50]
          },
          interactions: []
        },
        // Area Breakdown Chart
        {
          id: "bar_area_breakdown",
          type: "StackedBarChart",
          title: "Area Breakdown",
          position: { x: 520, y: 0, width: 500, height: 400 },
          dataFields: {
            "X-axis": "AreaAnalysis[Area]",
            "Y-axis": "AreaAnalysis[Residential],AreaAnalysis[Corporate],AreaAnalysis[Industrial],AreaAnalysis[Vehicular],AreaAnalysis[Construction],AreaAnalysis[Airport]"
          },
          formatting: {
            colorScheme: "Category",
            showDataLabels: true
          },
          interactions: []
        },
        // Area Summary Table
        {
          id: "table_area_summary",
          type: "Table",
          title: "Area Summary",
          position: { x: 0, y: 420, width: 1020, height: 200 },
          dataFields: {
            "Columns": "AreaAnalysis[Area],AreaAnalysis[City],AreaAnalysis[Total],AreaAnalysis[Residential],AreaAnalysis[Corporate],AreaAnalysis[Industrial]"
          },
          formatting: {
            conditionalFormatting: {
              "High": "#FEE2E2",
              "Medium": "#FEF3C7",
              "Low": "#D1FAE5"
            }
          },
          interactions: []
        }
      ],
      filters: []
    }
  ];
};

// Generate theme configuration
const generateTheme = (): PowerBITheme => {
  return {
    name: "Carbon Footprint",
    primaryColor: "#10B981",
    secondaryColor: "#3B82F6",
    accentColor: "#F59E0B",
    backgroundColor: "#F9FAFB",
    textColor: "#374151",
    fontFamily: "Segoe UI"
  };
};

// Generate data model
const generateDataModel = (): PowerBIDataModel => {
  return {
    tables: [
      {
        name: "UserMetrics",
        columns: [
          { name: "userId", dataType: "Text" },
          { name: "userName", dataType: "Text" },
          { name: "city", dataType: "Text" },
          { name: "area", dataType: "Text" },
          { name: "totalCO2", dataType: "Decimal Number", format: "0.0" },
          { name: "ecoScore", dataType: "Whole Number" },
          { name: "performanceLevel", dataType: "Text" },
          { name: "reportDate", dataType: "Date" },
          { name: "nextMonthPrediction", dataType: "Decimal Number", format: "0.0" },
          { name: "expectedChange", dataType: "Decimal Number", format: "0.0" }
        ],
        measures: []
      },
      {
        name: "CO2Breakdown",
        columns: [
          { name: "category", dataType: "Text" },
          { name: "value", dataType: "Decimal Number", format: "0.0" },
          { name: "percentage", dataType: "Decimal Number", format: "0.0%" },
          { name: "color", dataType: "Text" },
          { name: "description", dataType: "Text" }
        ],
        measures: []
      },
      {
        name: "ForecastData",
        columns: [
          { name: "month", dataType: "Text" },
          { name: "monthNumber", dataType: "Whole Number" },
          { name: "year", dataType: "Whole Number" },
          { name: "current", dataType: "Decimal Number", format: "0.0" },
          { name: "predicted", dataType: "Decimal Number", format: "0.0" },
          { name: "season", dataType: "Text" },
          { name: "temperature", dataType: "Text" },
          { name: "activities", dataType: "Text" },
          { name: "icon", dataType: "Text" }
        ],
        measures: []
      },
      {
        name: "SeasonalData",
        columns: [
          { name: "season", dataType: "Text" },
          { name: "month", dataType: "Text" },
          { name: "co2Value", dataType: "Decimal Number", format: "0.0" },
          { name: "temperature", dataType: "Text" },
          { name: "activities", dataType: "Text" },
          { name: "icon", dataType: "Text" },
          { name: "color", dataType: "Text" }
        ],
        measures: []
      },
      {
        name: "PeerComparison",
        columns: [
          { name: "category", dataType: "Text" },
          { name: "userValue", dataType: "Decimal Number", format: "0.0" },
          { name: "averageValue", dataType: "Decimal Number", format: "0.0" },
          { name: "percentile", dataType: "Decimal Number", format: "0.0" },
          { name: "performance", dataType: "Text" },
          { name: "color", dataType: "Text" }
        ],
        measures: []
      },
      {
        name: "AreaAnalysis",
        columns: [
          { name: "area", dataType: "Text" },
          { name: "city", dataType: "Text" },
          { name: "residential", dataType: "Decimal Number", format: "0.0" },
          { name: "corporate", dataType: "Decimal Number", format: "0.0" },
          { name: "industrial", dataType: "Decimal Number", format: "0.0" },
          { name: "vehicular", dataType: "Decimal Number", format: "0.0" },
          { name: "construction", dataType: "Decimal Number", format: "0.0" },
          { name: "airport", dataType: "Decimal Number", format: "0.0" },
          { name: "total", dataType: "Decimal Number", format: "0.0" }
        ],
        measures: []
      },
      {
        name: "Insights",
        columns: [
          { name: "type", dataType: "Text" },
          { name: "title", dataType: "Text" },
          { name: "message", dataType: "Text" },
          { name: "icon", dataType: "Text" },
          { name: "priority", dataType: "Whole Number" },
          { name: "category", dataType: "Text" }
        ],
        measures: []
      }
    ],
    relationships: []
  };
};

// Generate relationships
const generateRelationships = (): PowerBIRelationship[] => {
  return [
    {
      fromTable: "UserMetrics",
      fromColumn: "userId",
      toTable: "CO2Breakdown",
      toColumn: "userId",
      cardinality: "One-to-Many"
    },
    {
      fromTable: "UserMetrics",
      fromColumn: "userId",
      toTable: "ForecastData",
      toColumn: "userId",
      cardinality: "One-to-Many"
    },
    {
      fromTable: "UserMetrics",
      fromColumn: "userId",
      toTable: "SeasonalData",
      toColumn: "userId",
      cardinality: "One-to-Many"
    },
    {
      fromTable: "UserMetrics",
      fromColumn: "userId",
      toTable: "PeerComparison",
      toColumn: "userId",
      cardinality: "One-to-Many"
    },
    {
      fromTable: "UserMetrics",
      fromColumn: "userId",
      toTable: "AreaAnalysis",
      toColumn: "userId",
      cardinality: "One-to-Many"
    },
    {
      fromTable: "UserMetrics",
      fromColumn: "userId",
      toTable: "Insights",
      toColumn: "userId",
      cardinality: "One-to-Many"
    }
  ];
};

// Generate measures
const generateMeasures = (): PowerBIMeasure[] => {
  return [
    {
      name: "Total CO2",
      expression: "SUM(UserMetrics[totalCO2])",
      description: "Total CO2 emissions in kg",
      format: "0.0"
    },
    {
      name: "Eco Score",
      expression: "SUM(UserMetrics[ecoScore])",
      description: "Environmental impact score",
      format: "0"
    },
    {
      name: "Performance Level",
      expression: "IF([Total CO2] > 300, \"Needs Improvement\", IF([Total CO2] > 250, \"Average\", \"Good\"))",
      description: "Performance classification"
    },
    {
      name: "Next Month Prediction",
      expression: "SUM(UserMetrics[nextMonthPrediction])",
      description: "Predicted CO2 for next month",
      format: "0.0"
    },
    {
      name: "Expected Change",
      expression: "[Next Month Prediction] - [Total CO2]",
      description: "Expected change in CO2",
      format: "0.0"
    },
    {
      name: "Percentage Change",
      expression: "DIVIDE([Expected Change], [Total CO2], 0)",
      description: "Percentage change in CO2",
      format: "0.0%"
    },
    {
      name: "Peak Month",
      expression: "TOPN(1, ForecastData, ForecastData[Predicted], DESC)",
      description: "Month with highest predicted CO2"
    },
    {
      name: "Lowest Month",
      expression: "TOPN(1, ForecastData, ForecastData[Predicted], ASC)",
      description: "Month with lowest predicted CO2"
    },
    {
      name: "Performance Percentile",
      expression: "AVERAGE(PeerComparison[Percentile])",
      description: "Performance percentile",
      format: "0.0"
    }
  ];
};

// Generate slicers
const generateSlicers = (): PowerBISlicer[] => {
  return [
    {
      name: "Date Range",
      field: "ForecastData[Month]",
      type: "Between",
      style: "Dropdown",
      pages: ["Forecast Analysis", "Comparative Analysis"]
    },
    {
      name: "Category Filter",
      field: "CO2Breakdown[Category]",
      type: "List",
      style: "List",
      pages: ["CO2 Breakdown", "Comparative Analysis"]
    },
    {
      name: "Season Filter",
      field: "SeasonalData[Season]",
      type: "List",
      style: "Buttons",
      pages: ["Forecast Analysis", "Geographic Analysis"]
    },
    {
      name: "Performance Filter",
      field: "Performance Level",
      type: "List",
      style: "Dropdown",
      pages: ["Executive Summary", "Comparative Analysis"]
    }
  ];
};

// Generate bookmarks
const generateBookmarks = (): PowerBIBookmark[] => {
  return [
    {
      name: "Current Month",
      description: "Show current month data only",
      filters: { "ForecastData[Month]": "Current Month" },
      layout: {}
    },
    {
      name: "Full Year",
      description: "Show all 12 months",
      filters: {},
      layout: {}
    },
    {
      name: "High Impact",
      description: "Filter to high CO2 categories",
      filters: { "CO2Breakdown[Value]": "> 50" },
      layout: {}
    },
    {
      name: "Seasonal View",
      description: "Group by seasons",
      filters: { "GroupBy": "SeasonalData[Season]" },
      layout: {}
    },
    {
      name: "Reset",
      description: "Clear all filters",
      filters: {},
      layout: {}
    }
  ];
};

// Export template as JSON
export const exportPowerBITemplate = (userData: any): string => {
  const template = generatePowerBITemplate(userData);
  return JSON.stringify(template, null, 2);
};

// Export template as Power BI Desktop format (simplified)
export const exportPowerBIDesktopTemplate = (userData: any): Blob => {
  const template = generatePowerBITemplate(userData);
  
  // Create a simplified Power BI template structure
  const powerBITemplate = {
    version: "1.0",
    template: template,
    instructions: [
      "1. Open Power BI Desktop",
      "2. Import your data using the provided CSV/Excel files",
      "3. Apply this template configuration",
      "4. All visualizations will be pre-loaded",
      "5. Customize colors and formatting as needed"
    ],
    dataFiles: [
      "UserMetrics.csv",
      "CO2Breakdown.csv",
      "ForecastData.csv",
      "SeasonalData.csv",
      "PeerComparison.csv",
      "AreaAnalysis.csv",
      "Insights.csv"
    ]
  };
  
  return new Blob([JSON.stringify(powerBITemplate, null, 2)], { 
    type: 'application/json' 
  });
};
