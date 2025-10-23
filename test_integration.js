// Simple test script to verify frontend-backend integration
// Run this in the browser console or as a Node.js script

const testBackendConnection = async () => {
  console.log('🧪 Testing Frontend-Backend Integration...');
  
  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch('http://localhost:8000/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check passed:', healthData);
    
    // Test prediction
    console.log('2. Testing CO2 prediction...');
    const sampleData = {
      body_type: 'normal',
      sex: 'male',
      diet: 'vegetarian',
      shower_frequency: 'daily',
      heating_energy: 'natural gas',
      transport: 0.0,
      vehicle_distance: 1000.0,
      air_travel: 'rarely',
      social_activity: 'often',
      grocery_bill: 200.0,
      new_clothes: 3,
      tv_pc_hours: 4.0,
      internet_hours: 6.0,
      energy_efficiency: 'Yes',
      recycling: ['Paper', 'Plastic'],
      waste_bag_size: 10.0,
      waste_bag_count: 2,
      cooking_methods: ['Stove', 'Microwave'],
      city: 'Mumbai',
      area: 'Worli'
    };
    
    const predictionResponse = await fetch('http://localhost:8000/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sampleData)
    });
    
    const predictionData = await predictionResponse.json();
    console.log('✅ Prediction successful:', {
      predicted_co2: predictionData.predicted_co2,
      confidence: predictionData.confidence,
      model_used: predictionData.model_used
    });
    
    // Test recommendations
    console.log('3. Testing recommendations...');
    const recResponse = await fetch('http://localhost:8000/api/recommendations?city=Mumbai&area=Worli&current_co2=2500');
    const recData = await recResponse.json();
    console.log('✅ Recommendations received:', recData.length, 'items');
    
    console.log('🎉 All tests passed! Frontend-Backend integration is working.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('Make sure the backend is running: cd project/backend && python run.py');
  }
};

// Run the test
testBackendConnection();
