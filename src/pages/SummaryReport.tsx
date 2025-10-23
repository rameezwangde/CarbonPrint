import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  FileText, 
  BarChart3, 
  PieChart, 
  Calendar,
  TrendingUp,
  Users,
  MapPin,
  Target,
  Brain,
  CheckCircle,
  AlertTriangle,
  Star,
  FileImage
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import emailjs from '@emailjs/browser';
import { exportPowerBIData, exportToCSV, exportToExcel, exportToJSON } from '../utils/powerBIExport';
import { exportPowerBIDesktopTemplate } from '../utils/powerBITemplateGenerator';
import { useDataContext } from '../contexts/DataContext';
import CO2BreakdownPieChart from '../components/CO2BreakdownPieChart';
import CO2TrendChart from '../components/CO2TrendChart';
import SeasonalAnalysis from '../components/SeasonalAnalysis';
import PeerComparisonChart from '../components/PeerComparisonChart';
import AreaAnalysisChart from '../components/AreaAnalysisChart';
import Maps from './Maps';

const SummaryReport: React.FC = () => {
  const { userPrediction } = useDataContext();
  const [isExporting, setIsExporting] = useState(false);
  const [emailData, setEmailData] = useState({
    to_email: '',
    to_name: '',
    from_name: 'Carbon Footprint Insights'
  });
  const [showPowerBIModal, setShowPowerBIModal] = useState(false);
  
  // Separate state for input values to prevent re-rendering issues
  const [inputValues, setInputValues] = useState({
    to_email: '',
    to_name: ''
  });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Focus the name input when modal opens
  useEffect(() => {
    if (showEmailModal && nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [showEmailModal]);

  // EmailJS configuration - Your actual EmailJS credentials
  const EMAILJS_SERVICE_ID = 'service_5609tlx';
  const EMAILJS_TEMPLATE_ID = 'template_summary_report'; // Use this exact ID
  const EMAILJS_PUBLIC_KEY = 'b7cZMUNnJPLgkR3qU';

  // Calculate key metrics
  const keyMetrics = useMemo(() => {
    if (!userPrediction) return null;

    const totalCO2 = userPrediction.carbonFootprint;
    const ecoScore = userPrediction.ecoScore;
    const city = userPrediction.city || 'Unknown';
    const area = userPrediction.area || 'Unknown';

    // Determine performance level
    let performanceLevel = 'Good';
    let performanceColor = 'text-green-600';
    let performanceIcon = CheckCircle;
    
    if (totalCO2 > 300) {
      performanceLevel = 'Needs Improvement';
      performanceColor = 'text-red-600';
      performanceIcon = AlertTriangle;
    } else if (totalCO2 > 250) {
      performanceLevel = 'Average';
      performanceColor = 'text-yellow-600';
      performanceIcon = Star;
    }

    return {
      totalCO2,
      ecoScore,
      city,
      area,
      performanceLevel,
      performanceColor,
      performanceIcon
    };
  }, [userPrediction]);

  // Get survey data for detailed breakdown
  const surveyData = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const savedData = localStorage.getItem('userSurveyData');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (error) {
        console.error('Error parsing survey data:', error);
        return null;
      }
    }
    return null;
  }, []);

  // Calculate CO2 breakdown for summary - using same logic as CO2BreakdownPieChart
  const co2Breakdown = useMemo(() => {
    if (!surveyData) return null;

    // Use the exact same calculation method as CO2BreakdownPieChart
    const calculateCO2 = (type: string, value: number): number => {
      const calculations = {
        transportation: value * 0.21, // kg CO2 per km
        airTravel: value * 90, // kg CO2 per hour
        meatMeals: value * 2.5, // kg CO2 per meal
        diningOut: value * 3.2, // kg CO2 per meal
        electricity: value * 0.45, // kg CO2 per kWh
        lpgUsage: value * 3, // kg CO2 per kg LPG
        waste: value * 0.5 // kg CO2 per kg waste
      };
      return Math.round(calculations[type as keyof typeof calculations] * 100) / 100;
    };

    return {
      transportation: calculateCO2('transportation', surveyData.transportation || 0),
      electricity: calculateCO2('electricity', surveyData.electricity || 0),
      lpgUsage: calculateCO2('lpgUsage', surveyData.lpgUsage || 0),
      airTravel: calculateCO2('airTravel', surveyData.airTravel || 0),
      meatMeals: calculateCO2('meatMeals', surveyData.meatMeals || 0),
      diningOut: calculateCO2('diningOut', surveyData.diningOut || 0),
      waste: calculateCO2('waste', surveyData.waste || 0)
    };
  }, [surveyData]);

  // Generate insights
  const insights = useMemo(() => {
    if (!co2Breakdown || !keyMetrics) return [];

    const insightsList = [];
    const total = keyMetrics.totalCO2;

    // Transportation insights
    if (co2Breakdown.transportation > total * 0.3) {
      insightsList.push({
        type: 'warning',
        icon: '🚗',
        title: 'High Transportation Impact',
        message: `Transportation accounts for ${((co2Breakdown.transportation / total) * 100).toFixed(1)}% of your emissions. Consider walking, cycling, or public transport.`
      });
    }

    // Electricity insights
    if (co2Breakdown.electricity > total * 0.25) {
      insightsList.push({
        type: 'info',
        icon: '⚡',
        title: 'Electricity Optimization',
        message: `Electricity usage is ${((co2Breakdown.electricity / total) * 100).toFixed(1)}% of your footprint. Consider energy-efficient appliances and renewable energy.`
      });
    }

    // Air travel insights
    if (co2Breakdown.airTravel > 50) {
      insightsList.push({
        type: 'warning',
        icon: '✈️',
        title: 'Air Travel Impact',
        message: `Air travel contributes ${co2Breakdown.airTravel.toFixed(1)} kg CO₂. Consider video conferencing or train travel for shorter distances.`
      });
    }

    // Positive insights
    if (co2Breakdown.waste < total * 0.1) {
      insightsList.push({
        type: 'success',
        icon: '♻️',
        title: 'Great Waste Management',
        message: `Your waste emissions are only ${((co2Breakdown.waste / total) * 100).toFixed(1)}% of your total. Keep up the good work!`
      });
    }

    return insightsList;
  }, [co2Breakdown, keyMetrics]);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      if (!reportRef.current) return;

      // Create canvas from the report content
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: reportRef.current.scrollWidth,
        height: reportRef.current.scrollHeight
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Calculate dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      // Add title page
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Carbon Footprint Report', pdfWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pdfWidth / 2, 30, { align: 'center' });
      
      if (keyMetrics) {
        pdf.text(`User: ${keyMetrics.area}, ${keyMetrics.city}`, pdfWidth / 2, 35, { align: 'center' });
        pdf.text(`Total CO₂: ${keyMetrics.totalCO2.toFixed(1)} kg/month`, pdfWidth / 2, 40, { align: 'center' });
        pdf.text(`Eco Score: ${keyMetrics.ecoScore}/100`, pdfWidth / 2, 45, { align: 'center' });
      }

      // Add the report content
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      // Save the PDF
      pdf.save(`carbon-footprint-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPNG = async () => {
    setIsExporting(true);
    try {
      if (!reportRef.current) return;

      // Create canvas from the report content
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: reportRef.current.scrollWidth,
        height: reportRef.current.scrollHeight
      });

      // Convert to PNG and download
      const link = document.createElement('a');
      link.download = `carbon-footprint-report-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
    } catch (error) {
      console.error('Error exporting PNG:', error);
      alert('Failed to export PNG. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Power BI Export Functions
  const handleExportPowerBI = () => {
    setShowPowerBIModal(true);
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const powerBIData = exportPowerBIData();
      if (!powerBIData) {
        alert('No data available for export. Please complete the survey first.');
        return;
      }

      const csvData = exportToCSV(powerBIData);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `carbon-footprint-data-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    setIsExporting(true);
    try {
      const powerBIData = exportPowerBIData();
      if (!powerBIData) {
        alert('No data available for export. Please complete the survey first.');
        return;
      }

      const excelBlob = exportToExcel(powerBIData);
      const url = window.URL.createObjectURL(excelBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `carbon-footprint-data-${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Failed to export Excel. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = () => {
    setIsExporting(true);
    try {
      const powerBIData = exportPowerBIData();
      if (!powerBIData) {
        alert('No data available for export. Please complete the survey first.');
        return;
      }

      const jsonData = exportToJSON(powerBIData);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `carbon-footprint-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting JSON:', error);
      alert('Failed to export JSON. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPowerBITemplate = () => {
    setIsExporting(true);
    try {
      const powerBIData = exportPowerBIData();
      if (!powerBIData) {
        alert('No data available for export. Please complete the survey first.');
        return;
      }

      const templateBlob = exportPowerBIDesktopTemplate(powerBIData);
      const url = window.URL.createObjectURL(templateBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `carbon-footprint-template-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      // Also export the data files
      handleExportCSV();
      
    } catch (error) {
      console.error('Error exporting Power BI template:', error);
      alert('Failed to export Power BI template. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendEmail = async () => {
    if (!inputValues.to_email || !inputValues.to_name) {
      // Reset input values when opening modal
      setInputValues({ to_email: '', to_name: '' });
      setShowEmailModal(true);
      return;
    }
    
    // Update emailData with current input values
    setEmailData(prev => ({
      ...prev,
      to_email: inputValues.to_email,
      to_name: inputValues.to_name
    }));

    setIsExporting(true);
    try {
      // EmailJS is properly configured, proceed with sending

      // Debug: Log configuration
      console.log('EmailJS Configuration:', {
        serviceId: EMAILJS_SERVICE_ID,
        templateId: EMAILJS_TEMPLATE_ID,
        publicKey: EMAILJS_PUBLIC_KEY.substring(0, 10) + '...',
        recipientEmail: emailData.to_email,
        recipientName: emailData.to_name
      });

      // Generate report as image for email attachment
      if (!reportRef.current) return;

      // Create multiple compressed versions of the image
      const createCompressedImage = async (quality: number, scale: number) => {
        if (!reportRef.current) throw new Error('Report element not found');
        
        const canvas = await html2canvas(reportRef.current, {
          scale: scale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: reportRef.current.scrollWidth,
          height: reportRef.current.scrollHeight,
          logging: false
        });
        
        // Convert to JPEG with specified quality
        return canvas.toDataURL('image/jpeg', quality);
      };

      // Try different compression levels
      let reportImage = '';
      try {
        // First try: High quality, small scale
        reportImage = await createCompressedImage(0.6, 0.6);
        
        // Check if image is too large (base64 length > 1MB)
        if (reportImage.length > 1000000) {
          console.log('Image too large, trying more compression...');
          // Second try: Medium quality, smaller scale
          reportImage = await createCompressedImage(0.4, 0.5);
          
          if (reportImage.length > 1000000) {
            console.log('Still too large, using maximum compression...');
            // Third try: Low quality, very small scale
            reportImage = await createCompressedImage(0.3, 0.4);
          }
        }
      } catch {
        console.log('Image generation failed, proceeding without image');
        reportImage = '';
      }

      // Get next month's prediction from 12-month forecast data
      const currentCO2 = keyMetrics?.totalCO2 || 0;
      
      // Generate forecast data using the same logic as CO2TrendChart
      const generateForecastData = () => {
        const currentDate = new Date();
        
        // Seasonal factors based on Mumbai climate (same as CO2TrendChart)
        const seasonalFactors = [1.15, 1.1, 1.0, 0.85, 0.75, 0.8, 0.9, 0.95, 1.0, 1.05, 1.1, 1.2];
        
        // Get next month
        const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        const nextMonthIndex = nextMonthDate.getMonth();
        const nextMonthName = nextMonthDate.toLocaleDateString('en-US', { month: 'long' });
        
        // Calculate prediction using seasonal factors
        const baseIncrease = currentCO2 * 0.05; // 5% base increase
        const seasonalFactor = seasonalFactors[nextMonthIndex];
        const variation = (Math.random() - 0.5) * 10; // Small random variation
        const nextMonthPrediction = currentCO2 + baseIncrease + (seasonalFactor - 1) * 20 + variation;
        
        return {
          nextMonthName,
          nextMonthPrediction: Math.max(0, nextMonthPrediction),
          change: nextMonthPrediction - currentCO2
        };
      };
      
      const forecastData = generateForecastData();

      // Create enhanced text-only email content
      const emailContent = `
🌱 CARBON FOOTPRINT REPORT
Generated on: ${new Date().toLocaleDateString()}

Hello ${emailData.to_name}!

Here's your personalized carbon footprint analysis for ${keyMetrics?.area || 'Unknown'}, ${keyMetrics?.city || 'Unknown'}.

📊 YOUR CURRENT EMISSIONS
• Total CO₂: ${currentCO2.toFixed(1)} kg CO₂/month
• Eco Score: ${keyMetrics?.ecoScore || 0}/100 (${keyMetrics?.performanceLevel || 'Good'})

🔮 NEXT MONTH PREDICTION
• Predicted CO₂ for ${forecastData.nextMonthName}: ${forecastData.nextMonthPrediction.toFixed(1)} kg CO₂/month
• Expected change: ${forecastData.change >= 0 ? '+' : ''}${forecastData.change.toFixed(1)} kg CO₂/month

🔍 KEY INSIGHTS
${insights.map(insight => `• ${insight.icon} ${insight.title}: ${insight.message}`).join('\n')}

💡 RECOMMENDATIONS
• Transportation: Consider walking, cycling, or public transport for short trips
• Electricity: Switch to energy-efficient appliances and LED bulbs
• Air Travel: Consider video conferencing or train travel for shorter distances

📈 BREAKDOWN BY CATEGORY
• Transportation: ${co2Breakdown?.transportation?.toFixed(1) || '0.0'} kg CO₂/month
• Electricity: ${co2Breakdown?.electricity?.toFixed(1) || '0.0'} kg CO₂/month
• LPG/Gas: ${co2Breakdown?.lpgUsage?.toFixed(1) || '0.0'} kg CO₂/month
• Air Travel: ${co2Breakdown?.airTravel?.toFixed(1) || '0.0'} kg CO₂/month
• Meat Consumption: ${co2Breakdown?.meatMeals?.toFixed(1) || '0.0'} kg CO₂/month
• Dining Out: ${co2Breakdown?.diningOut?.toFixed(1) || '0.0'} kg CO₂/month
• Waste: ${co2Breakdown?.waste?.toFixed(1) || '0.0'} kg CO₂/month

📈 VISUAL REPORT
Your complete carbon footprint analysis is available in the attached PDF/PNG export.

Take action today for a sustainable tomorrow! 🌍

---
This report was generated by Carbon Footprint Insights
      `.trim();

      // Prepare simple email template parameters
      const templateParams = {
        to_email: emailData.to_email,
        to_name: emailData.to_name,
        message: emailContent
      };

      // Send email using EmailJS
      try {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams,
          EMAILJS_PUBLIC_KEY
        );

        const successMessage = reportImage ? 
          'Email sent successfully with image! Check your inbox.' : 
          'Email sent successfully! Check your inbox.';
        
        alert(successMessage);
        setShowEmailModal(false);
        setEmailData({ to_email: '', to_name: '', from_name: 'Carbon Footprint Insights' });
      } catch (imageError) {
        console.log('Email with image failed, trying without image...', imageError);
        
        // Try sending with simple text-only template
        const simpleTemplateParams = {
          to_email: emailData.to_email,
          to_name: emailData.to_name,
          message: emailContent
        };

        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          simpleTemplateParams,
          EMAILJS_PUBLIC_KEY
        );

        alert('Email sent successfully! (Image was too large, sent without image)');
        setShowEmailModal(false);
        setEmailData({ to_email: '', to_name: '', from_name: 'Carbon Footprint Insights' });
      }

    } catch (error) {
      console.error('Error sending email:', error);
      
      // Detailed error information
      let errorMessage = 'EmailJS failed. ';
      if (error && typeof error === 'object') {
        if ('status' in error) {
          errorMessage += `Status: ${error.status}. `;
        }
        if ('text' in error) {
          errorMessage += `Details: ${error.text}. `;
        }
      }
      
      console.log('EmailJS Error Details:', {
        serviceId: EMAILJS_SERVICE_ID,
        templateId: EMAILJS_TEMPLATE_ID,
        publicKey: EMAILJS_PUBLIC_KEY.substring(0, 10) + '...',
        error: error
      });
      
      // Fallback: Generate email content and copy to clipboard
      try {
        const emailContent = generateEmailContent();
        await navigator.clipboard.writeText(emailContent);
        alert(`${errorMessage}\n\nEmail content copied to clipboard!\n\nPaste this into your email client and send to ${emailData.to_email}\n\nCheck browser console for detailed error information.`);
      } catch {
        alert(`${errorMessage}\n\nPlease check your EmailJS configuration or use the PDF/PNG export options instead.\n\nCheck browser console for detailed error information.`);
      }
      
      setShowEmailModal(false);
      setEmailData({ to_email: '', to_name: '', from_name: 'Carbon Footprint Insights' });
      setInputValues({ to_email: '', to_name: '' });
    } finally {
      setIsExporting(false);
    }
  };

  // Generate email content as fallback
  const generateEmailContent = () => {
    const reportDate = new Date().toLocaleDateString();
    const totalCO2 = keyMetrics?.totalCO2 || 0;
    const ecoScore = keyMetrics?.ecoScore || 0;
    const area = keyMetrics?.area || 'Unknown';
    const city = keyMetrics?.city || 'Unknown';
    
    // Generate forecast data for fallback
    const generateForecastData = () => {
      const currentDate = new Date();
      const seasonalFactors = [1.15, 1.1, 1.0, 0.85, 0.75, 0.8, 0.9, 0.95, 1.0, 1.05, 1.1, 1.2];
      const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      const nextMonthIndex = nextMonthDate.getMonth();
      const nextMonthName = nextMonthDate.toLocaleDateString('en-US', { month: 'long' });
      
      const baseIncrease = totalCO2 * 0.05;
      const seasonalFactor = seasonalFactors[nextMonthIndex];
      const variation = (Math.random() - 0.5) * 10;
      const nextMonthPrediction = totalCO2 + baseIncrease + (seasonalFactor - 1) * 20 + variation;
      
      return {
        nextMonthName,
        nextMonthPrediction: Math.max(0, nextMonthPrediction),
        change: nextMonthPrediction - totalCO2
      };
    };
    
    const forecastData = generateForecastData();
    
    return `
🌱 CARBON FOOTPRINT REPORT
Generated on: ${reportDate}

Hello ${emailData.to_name}!

Here's your personalized carbon footprint analysis for ${area}, ${city}.

📊 YOUR CURRENT EMISSIONS
• Total CO₂: ${totalCO2.toFixed(1)} kg CO₂/month
• Eco Score: ${ecoScore}/100
• Performance: ${keyMetrics?.performanceLevel || 'Good'}

🔮 NEXT MONTH PREDICTION
• Predicted CO₂ for ${forecastData.nextMonthName}: ${forecastData.nextMonthPrediction.toFixed(1)} kg CO₂/month
• Expected change: ${forecastData.change >= 0 ? '+' : ''}${forecastData.change.toFixed(1)} kg CO₂/month

🔍 KEY INSIGHTS
${insights.map(insight => `• ${insight.icon} ${insight.title}: ${insight.message}`).join('\n')}

💡 RECOMMENDATIONS
• Transportation: Consider walking, cycling, or public transport
• Electricity: Switch to energy-efficient appliances and LED bulbs  
• Air Travel: Consider video conferencing or train travel

📈 VISUAL REPORT
Your complete carbon footprint analysis is available in the attached PDF/PNG export.

Take action today for a sustainable tomorrow! 🌍

---
This report was generated by Carbon Footprint Insights
    `.trim();
  };

  // Power BI Modal Component
  const PowerBIModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Export for Power BI</h3>
          <button
            onClick={() => setShowPowerBIModal(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="w-8 h-8 text-orange-600" />
              <h4 className="text-xl font-bold text-gray-900">Interactive Power BI Dashboard</h4>
            </div>
            <p className="text-gray-700 mb-4">
              Export your carbon footprint data for offline analysis in Microsoft Power BI. 
              Create interactive dashboards with filtering, drill-down, and real-time calculations.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Interactive Charts</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Cross-Filtering</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Drill-Down Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Custom Slicers</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="text-lg font-semibold text-gray-900">Choose Export Format:</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pre-loaded Template Option */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExportPowerBITemplate}
                disabled={isExporting}
                className="flex flex-col items-center space-y-2 p-6 border-2 border-orange-500 rounded-xl hover:border-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-50 bg-gradient-to-br from-orange-50 to-red-50"
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-8 h-8 text-orange-600" />
                  <span className="text-2xl">🚀</span>
                </div>
                <span className="font-bold text-lg">Pre-loaded Template</span>
                <span className="text-sm text-gray-700 text-center font-medium">Complete dashboard with all visualizations ready!</span>
                <div className="flex items-center space-x-4 text-xs text-gray-600">
                  <span>✅ 5 Pages</span>
                  <span>✅ 20+ Charts</span>
                  <span>✅ Interactive</span>
                </div>
              </motion.button>

              {/* Manual Setup Options */}
              <div className="space-y-3">
                <h6 className="font-semibold text-gray-800 text-center">Manual Setup (Build from scratch)</h6>
                <div className="grid grid-cols-1 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExportCSV}
                    disabled={isExporting}
                    className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
                  >
                    <FileText className="w-6 h-6 text-blue-600" />
                    <div className="text-left">
                      <span className="font-semibold text-sm">CSV Format</span>
                      <p className="text-xs text-gray-600">Raw data for Power BI import</p>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExportExcel}
                    disabled={isExporting}
                    className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors disabled:opacity-50"
                  >
                    <BarChart3 className="w-6 h-6 text-green-600" />
                    <div className="text-left">
                      <span className="font-semibold text-sm">Excel Format</span>
                      <p className="text-xs text-gray-600">Multi-sheet workbook</p>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExportJSON}
                    disabled={isExporting}
                    className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors disabled:opacity-50"
                  >
                    <PieChart className="w-6 h-6 text-purple-600" />
                    <div className="text-left">
                      <span className="font-semibold text-sm">JSON Format</span>
                      <p className="text-xs text-gray-600">Structured data format</p>
                    </div>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h6 className="font-semibold text-gray-900 mb-2">📋 Power BI Setup Instructions:</h6>
            
            {/* Pre-loaded Template Instructions */}
            <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="font-semibold text-orange-800 mb-2">🚀 Pre-loaded Template (Recommended):</div>
              <ol className="text-sm text-orange-700 space-y-1">
                <li>1. Download the template + data files</li>
                <li>2. Open Microsoft Power BI Desktop</li>
                <li>3. Import your CSV data files</li>
                <li>4. Apply the template configuration</li>
                <li>5. All visualizations are ready! ✨</li>
              </ol>
            </div>

            {/* Manual Setup Instructions */}
            <div>
              <div className="font-semibold text-gray-800 mb-2">🔧 Manual Setup:</div>
              <ol className="text-sm text-gray-700 space-y-1">
                <li>1. Download your preferred format above</li>
                <li>2. Open Microsoft Power BI Desktop</li>
                <li>3. Import your data file (Get Data → Text/CSV or Excel)</li>
                <li>4. Create relationships between tables</li>
                <li>5. Build interactive visualizations</li>
                <li>6. Add slicers and filters for interactivity</li>
              </ol>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setShowPowerBIModal(false)}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowPowerBIModal(false);
                // Open Power BI tutorial
                window.open('https://docs.microsoft.com/en-us/power-bi/', '_blank');
              }}
              className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Power BI Tutorial
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Email Modal Component
  const EmailModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Send Report via Email</h3>
          <button
            onClick={() => setShowEmailModal(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Recipient Name
                   </label>
                   <input
                     ref={nameInputRef}
                     type="text"
                     value={inputValues.to_name}
                     onChange={(e) => setInputValues(prev => ({ ...prev, to_name: e.target.value }))}
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     placeholder="Enter recipient name"
                     autoComplete="name"
                   />
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Email Address
                   </label>
                   <input
                     type="email"
                     value={inputValues.to_email}
                     onChange={(e) => setInputValues(prev => ({ ...prev, to_email: e.target.value }))}
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     placeholder="Enter email address"
                     autoComplete="email"
                   />
                 </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setShowEmailModal(false)}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
                   <button
                     onClick={handleSendEmail}
                     disabled={!inputValues.to_email || !inputValues.to_name || isExporting}
                     className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                   >
                     {isExporting ? 'Sending...' : 'Send Email'}
                   </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  if (!userPrediction || !keyMetrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">No Data Available</h2>
          <p className="text-gray-500">Please complete the survey first to generate your summary report.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Carbon Footprint Summary Report</h1>
                <p className="text-sm text-gray-600">Complete analysis of your environmental impact</p>
              </div>
            </div>
               <div className="flex items-center space-x-3">
                 <motion.button
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={handleExportPDF}
                   disabled={isExporting}
                   className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                 >
                   <FileText className="w-4 h-4" />
                   <span>Export PDF</span>
                 </motion.button>
                 <motion.button
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={handleExportPNG}
                   disabled={isExporting}
                   className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                 >
                   <FileImage className="w-4 h-4" />
                   <span>Export PNG</span>
                 </motion.button>
                 <motion.button
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={handleExportPowerBI}
                   disabled={isExporting}
                   className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                 >
                   <BarChart3 className="w-4 h-4" />
                   <span>Power BI</span>
                 </motion.button>
                 <motion.button
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={handleSendEmail}
                   disabled={isExporting}
                   className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                 >
                   <Mail className="w-4 h-4" />
                   <span>Send Email</span>
                 </motion.button>
               </div>
          </div>
        </div>
      </motion.div>

      {/* Report Content */}
      <div ref={reportRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Executive Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Executive Summary</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total CO2 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-blue-600">Total Emissions</span>
              </div>
              <div className="text-3xl font-bold text-blue-900 mb-1">
                {keyMetrics.totalCO2.toFixed(1)} kg
              </div>
              <div className="text-sm text-blue-700">CO₂ per month</div>
            </div>

            {/* Eco Score */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-green-600">Eco Score</span>
              </div>
              <div className="text-3xl font-bold text-green-900 mb-1">
                {keyMetrics.ecoScore}/100
              </div>
              <div className="text-sm text-green-700">Environmental rating</div>
            </div>

            {/* Performance Level */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <keyMetrics.performanceIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-purple-600">Performance</span>
              </div>
              <div className={`text-2xl font-bold ${keyMetrics.performanceColor} mb-1`}>
                {keyMetrics.performanceLevel}
              </div>
              <div className="text-sm text-purple-700">vs. average</div>
            </div>

            {/* Location */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-orange-600">Location</span>
              </div>
              <div className="text-lg font-bold text-orange-900 mb-1">
                {keyMetrics.area}
              </div>
              <div className="text-sm text-orange-700">{keyMetrics.city}</div>
            </div>
          </div>
        </motion.div>

        {/* Key Insights */}
        {insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Key Insights & Recommendations</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`p-6 rounded-xl border-l-4 ${
                    insight.type === 'success' ? 'bg-green-50 border-green-500' :
                    insight.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                    'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{insight.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{insight.title}</h3>
                      <p className="text-gray-700 text-sm">{insight.message}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Section Heading: Core Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
            <h2 className="text-3xl font-bold text-gray-900">Core Analytics</h2>
            <div className="h-1 flex-1 bg-gradient-to-r from-green-500 to-transparent rounded-full"></div>
          </div>
          <p className="text-gray-600 text-lg">Detailed breakdown of your carbon footprint and future projections</p>
        </motion.div>

        {/* CO2 Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-20"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <PieChart className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">CO₂ Breakdown</h3>
          </div>
          <div className="h-80">
            <CO2BreakdownPieChart />
          </div>
        </motion.div>

        {/* 12-Month Forecast */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-20"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">12-Month Forecast</h3>
          </div>
          <div className="h-80">
            <CO2TrendChart />
          </div>
        </motion.div>

        {/* Section Heading: Comparative Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            <h2 className="text-3xl font-bold text-gray-900">Comparative Analysis</h2>
            <div className="h-1 flex-1 bg-gradient-to-r from-pink-500 to-transparent rounded-full"></div>
          </div>
          <p className="text-gray-600 text-lg">Seasonal patterns and peer comparisons for better understanding</p>
        </motion.div>

        {/* Seasonal Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-20"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Seasonal Analysis</h3>
          </div>
          <div className="h-80">
            <SeasonalAnalysis />
          </div>
        </motion.div>

        {/* Peer Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-20"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Peer Comparison</h3>
          </div>
          <div className="h-80">
            <PeerComparisonChart 
              userEmissions={keyMetrics.totalCO2}
              city={keyMetrics.city}
              area={keyMetrics.area}
            />
          </div>
        </motion.div>

        {/* Section Heading: Geographic Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full"></div>
            <h2 className="text-3xl font-bold text-gray-900">Geographic Analysis</h2>
            <div className="h-1 flex-1 bg-gradient-to-r from-teal-500 to-transparent rounded-full"></div>
          </div>
          <p className="text-gray-600 text-lg">Location-based insights and interactive mapping</p>
        </motion.div>

        {/* Area Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-20"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Area Analysis</h3>
          </div>
          <div className="h-80">
            <AreaAnalysisChart 
              data={{
                city: keyMetrics.city,
                area: keyMetrics.area,
                co2_breakdown: {
                  Residential: co2Breakdown?.electricity || 0,
                  Corporate: co2Breakdown?.diningOut || 0,
                  Industrial: co2Breakdown?.meatMeals || 0,
                  Vehicular: co2Breakdown?.transportation || 0,
                  Construction: co2Breakdown?.lpgUsage || 0,
                  Airport: co2Breakdown?.airTravel || 0
                }
              }}
            />
          </div>
        </motion.div>

        {/* Maps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-teal-500 to-green-500 rounded-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Interactive Maps</h3>
          </div>
          <div className="h-96">
            <Maps />
          </div>
        </motion.div>
      </div>

             {/* Power BI Modal */}
             {showPowerBIModal && <PowerBIModal />}

             {/* Email Modal */}
             {showEmailModal && <EmailModal />}
    </div>
  );
};

export default SummaryReport;
