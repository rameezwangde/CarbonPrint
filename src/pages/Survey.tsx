import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MapPin, Loader2 } from 'lucide-react';
import Slider from '../components/Slider';
import DiscreteSlider from '../components/DiscreteSlider';

interface SurveyData {
  // Profile fields
  sex: number;
  bodyType: number;
  domain: number;
  area: number;
  country: number;
  
  // Location fields
  city: number;
  state: number;
  zipCode: number;
  
  // Numeric sliders
  vehicleMonthlyDistance: number;
  monthlyGroceryBill: number;
  tvPcHoursPerDay: number;
  internetHoursPerDay: number;
  newClothesPerMonth: number;
  wasteBagsPerMonth: number;
  flightFrequencyPerYear: number;
  showersPerWeek: number;
  
  // Discrete sliders
  diet: number;
  transport: number;
  vehicleType: number;
  wasteBagSize: number;
  energyEfficiency: number;
  heatingEnergySource: number;
  recycling: number;
  cookingWith: number;
}

const Survey: React.FC = () => {
  const [formData, setFormData] = useState<SurveyData>({
    sex: 0,
    bodyType: 1,
    domain: 0,
    area: 1,
    country: 0,
    city: 0,
    state: 0,
    zipCode: 0,
    vehicleMonthlyDistance: 500,
    monthlyGroceryBill: 300,
    tvPcHoursPerDay: 4,
    internetHoursPerDay: 6,
    newClothesPerMonth: 2,
    wasteBagsPerMonth: 8,
    flightFrequencyPerYear: 2,
    showersPerWeek: 7,
    diet: 2,
    transport: 2,
    vehicleType: 2,
    wasteBagSize: 1,
    energyEfficiency: 1,
    heatingEnergySource: 1,
    recycling: 1,
    cookingWith: 2,
  });

  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'success' | 'error'>('idle');
  const [locationData, setLocationData] = useState<{
    latitude?: number;
    longitude?: number;
    city?: string;
    state?: string;
    country?: string;
  }>({});

  const requestLocation = () => {
    setLocationStatus('requesting');
    
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use a reverse geocoding service to get location details
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          
          setLocationData({
            latitude,
            longitude,
            city: data.city || data.locality,
            state: data.principalSubdivision,
            country: data.countryName
          });
          setLocationStatus('success');
        } catch (error) {
          setLocationData({ latitude, longitude });
          setLocationStatus('success');
        }
      },
      () => {
        setLocationStatus('error');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      location: locationData
    };
    console.log('Survey Data:', JSON.stringify(submissionData, null, 2));
    alert('Survey submitted! Check console for data.');
  };

  const dietOptions = ['Vegan', 'Vegetarian', 'Pescatarian', 'Mixed', 'Meat-heavy'];
  const transportOptions = ['Walk/Cycle', 'Public', 'Carpool', 'Motorbike', 'Car Solo'];
  const vehicleTypeOptions = ['None', 'EV', 'Hybrid', 'Petrol', 'Diesel'];
  const wasteBagSizeOptions = ['Small', 'Medium', 'Large'];
  const energyEfficiencyOptions = ['Poor', 'Average', 'Good', 'Excellent'];
  const heatingEnergyOptions = ['Coal', 'Gas', 'Electric', 'Renewable'];
  const recyclingOptions = ['None', 'Partial', 'Full'];
  const cookingWithOptions = ['Wood', 'Gas', 'Electric', 'Induction'];
  
  // Location options
  const cityOptions = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Other'];
  const stateOptions = ['California', 'Texas', 'Florida', 'New York', 'Pennsylvania', 'Illinois', 'Ohio', 'Georgia', 'North Carolina', 'Michigan', 'Other'];
  const zipCodeRanges = ['10000-19999', '20000-29999', '30000-39999', '40000-49999', '50000-59999', '60000-69999', '70000-79999', '80000-89999', '90000-99999'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Carbon Footprint Survey
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Help us understand your lifestyle to provide personalized carbon footprint insights.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-100"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DiscreteSlider
                  label="Sex"
                  value={formData.sex}
                  onChange={(value) => setFormData(prev => ({ ...prev, sex: value }))}
                  options={['Male', 'Female', 'Other']}
                  helpText="Biological sex for demographic analysis"
                />

                <DiscreteSlider
                  label="Body Type"
                  value={formData.bodyType}
                  onChange={(value) => setFormData(prev => ({ ...prev, bodyType: value }))}
                  options={['Underweight', 'Normal', 'Overweight', 'Obese']}
                  helpText="Body type affects metabolic carbon calculations"
                />

                <DiscreteSlider
                  label="Domain"
                  value={formData.domain}
                  onChange={(value) => setFormData(prev => ({ ...prev, domain: value }))}
                  options={['Technology', 'Healthcare', 'Education', 'Finance', 'Manufacturing', 'Other']}
                  helpText="Your primary work or study domain"
                />

                <DiscreteSlider
                  label="Area Type"
                  value={formData.area}
                  onChange={(value) => setFormData(prev => ({ ...prev, area: value }))}
                  options={['Urban', 'Suburban', 'Rural']}
                  helpText="Type of area where you live"
                />

                {/* <div className="md:col-span-2">
                  <DiscreteSlider
                    label="Country"
                    value={formData.country}
                    onChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                    options={['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Australia', 'Other']}
                    helpText="Your country of residence"
                  />
                </div> */}
                
                {/* <DiscreteSlider
                  label="City"
                  value={formData.city}
                  onChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
                  options={cityOptions}
                  helpText="Your city or nearest major city"
                /> */}
                
                {/* <DiscreteSlider
                  label="State/Province"
                  value={formData.state}
                  onChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
                  options={stateOptions}
                  helpText="Your state or province"
                /> */}
                
                {/* <div className="md:col-span-2">
                  <DiscreteSlider
                    label="ZIP Code Range"
                    value={formData.zipCode}
                    onChange={(value) => setFormData(prev => ({ ...prev, zipCode: value }))}
                    options={zipCodeRanges}
                    helpText="Select the range that includes your ZIP/postal code"
                  />
                </div> */}
              </div>
            </div>

            {/* Location Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Location Access</h2>
              <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Share Your Location
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Allow location access to automatically detect your geographic area for more accurate carbon footprint analysis.
                  </p>
                  
                  {locationStatus === 'idle' && (
                    <button
                      type="button"
                      onClick={requestLocation}
                      className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center space-x-2 mx-auto"
                    >
                      <MapPin className="w-5 h-5" />
                      <span>Allow Location Access</span>
                    </button>
                  )}
                  
                  {locationStatus === 'requesting' && (
                    <div className="flex items-center justify-center space-x-2 text-emerald-600">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Detecting location...</span>
                    </div>
                  )}
                  
                  {locationStatus === 'success' && (
                    <div className="text-emerald-600">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <MapPin className="w-5 h-5" />
                        <span className="font-medium">Location detected!</span>
                      </div>
                      {locationData.city && (
                        <p className="text-sm">
                          {locationData.city}, {locationData.state}, {locationData.country}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Coordinates: {locationData.latitude?.toFixed(4)}, {locationData.longitude?.toFixed(4)}
                      </p>
                    </div>
                  )}
                  
                  {locationStatus === 'error' && (
                    <div className="text-red-600">
                      <p className="font-medium mb-2">Location access denied</p>
                      <button
                        type="button"
                        onClick={requestLocation}
                        className="text-sm text-emerald-600 hover:text-emerald-700 underline"
                      >
                        Try again
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Lifestyle Sliders */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Lifestyle & Consumption</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Slider
                  label="Vehicle Monthly Distance"
                  value={formData.vehicleMonthlyDistance}
                  onChange={(value) => setFormData(prev => ({ ...prev, vehicleMonthlyDistance: value }))}
                  min={0}
                  max={2000}
                  unit=" km"
                  helpText="How many kilometers do you drive per month?"
                />

                <Slider
                  label="Monthly Grocery Bill"
                  value={formData.monthlyGroceryBill}
                  onChange={(value) => setFormData(prev => ({ ...prev, monthlyGroceryBill: value }))}
                  min={0}
                  max={1000}
                  unit=" $"
                  helpText="Your average monthly spending on groceries"
                />

                <Slider
                  label="TV/PC Hours per Day"
                  value={formData.tvPcHoursPerDay}
                  onChange={(value) => setFormData(prev => ({ ...prev, tvPcHoursPerDay: value }))}
                  min={0}
                  max={12}
                  unit=" hrs"
                  helpText="Daily screen time for entertainment and work"
                />

                <Slider
                  label="Internet Hours per Day"
                  value={formData.internetHoursPerDay}
                  onChange={(value) => setFormData(prev => ({ ...prev, internetHoursPerDay: value }))}
                  min={0}
                  max={12}
                  unit=" hrs"
                  helpText="Daily internet usage across all devices"
                />

                <Slider
                  label="New Clothes per Month"
                  value={formData.newClothesPerMonth}
                  onChange={(value) => setFormData(prev => ({ ...prev, newClothesPerMonth: value }))}
                  min={0}
                  max={10}
                  unit=" items"
                  helpText="Average number of new clothing items purchased monthly"
                />

                <Slider
                  label="Waste Bags per Month"
                  value={formData.wasteBagsPerMonth}
                  onChange={(value) => setFormData(prev => ({ ...prev, wasteBagsPerMonth: value }))}
                  min={0}
                  max={30}
                  unit=" bags"
                  helpText="Number of waste bags you dispose of monthly"
                />

                <Slider
                  label="Flight Frequency per Year"
                  value={formData.flightFrequencyPerYear}
                  onChange={(value) => setFormData(prev => ({ ...prev, flightFrequencyPerYear: value }))}
                  min={0}
                  max={20}
                  unit=" flights"
                  helpText="Number of flights taken annually"
                />

                <Slider
                  label="Showers per Week"
                  value={formData.showersPerWeek}
                  onChange={(value) => setFormData(prev => ({ ...prev, showersPerWeek: value }))}
                  min={0}
                  max={21}
                  unit=" showers"
                  helpText="Number of showers taken per week"
                />
              </div>
            </div>

            {/* Categorical Sliders */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Preferences & Choices</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <DiscreteSlider
                  label="Diet"
                  value={formData.diet}
                  onChange={(value) => setFormData(prev => ({ ...prev, diet: value }))}
                  options={dietOptions}
                  helpText="Your primary dietary preference"
                />

                <DiscreteSlider
                  label="Primary Transport"
                  value={formData.transport}
                  onChange={(value) => setFormData(prev => ({ ...prev, transport: value }))}
                  options={transportOptions}
                  helpText="Most common method of transportation"
                />

                <DiscreteSlider
                  label="Vehicle Type"
                  value={formData.vehicleType}
                  onChange={(value) => setFormData(prev => ({ ...prev, vehicleType: value }))}
                  options={vehicleTypeOptions}
                  helpText="Type of vehicle you own or use most often"
                />

                <DiscreteSlider
                  label="Waste Bag Size"
                  value={formData.wasteBagSize}
                  onChange={(value) => setFormData(prev => ({ ...prev, wasteBagSize: value }))}
                  options={wasteBagSizeOptions}
                  helpText="Average size of waste bags you use"
                />

                <DiscreteSlider
                  label="Energy Efficiency"
                  value={formData.energyEfficiency}
                  onChange={(value) => setFormData(prev => ({ ...prev, energyEfficiency: value }))}
                  options={energyEfficiencyOptions}
                  helpText="Energy efficiency rating of your home"
                />

                <DiscreteSlider
                  label="Heating Energy Source"
                  value={formData.heatingEnergySource}
                  onChange={(value) => setFormData(prev => ({ ...prev, heatingEnergySource: value }))}
                  options={heatingEnergyOptions}
                  helpText="Primary energy source for heating"
                />

                <DiscreteSlider
                  label="Recycling"
                  value={formData.recycling}
                  onChange={(value) => setFormData(prev => ({ ...prev, recycling: value }))}
                  options={recyclingOptions}
                  helpText="How much do you recycle?"
                />

                <DiscreteSlider
                  label="Cooking With"
                  value={formData.cookingWith}
                  onChange={(value) => setFormData(prev => ({ ...prev, cookingWith: value }))}
                  options={cookingWithOptions}
                  helpText="Primary cooking energy source"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center pt-8"
            >
              <button
                type="submit"
                className="group bg-gray-900 text-white px-12 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-800 transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl mx-auto"
              >
                <span>Submit Survey</span>
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Survey;