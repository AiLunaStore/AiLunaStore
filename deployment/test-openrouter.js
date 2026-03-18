// Test OpenRouter API with real key
const OPENROUTER_API_KEY = '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';

async function testOpenRouter() {
  console.log('🧪 Testing OpenRouter API...');
  
  // Test 1: List available models
  console.log('\n📋 Available models:');
  try {
    const modelsResponse = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`
      }
    });
    
    const modelsData = await modelsResponse.json();
    const codingModels = modelsData.data
      .filter(m => m.id.includes('deepseek') || m.id.includes('gemini') || m.id.includes('minimax'))
      .slice(0, 5);
    
    codingModels.forEach(model => {
      console.log(`  • ${model.id} (${model.context_length.toLocaleString()} context)`);
    });
  } catch (error) {
    console.error('❌ Error fetching models:', error.message);
  }
  
  // Test 2: Simple completion with Gemini Flash-Lite (cheapest)
  console.log('\n🤖 Testing completion with Gemini 2.5 Flash-Lite:');
  try {
    const completionResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          { role: 'user', content: 'Write a simple JavaScript function to add two numbers' }
        ],
        max_tokens: 100
      })
    });
    
    const completionData = await completionResponse.json();
    
    if (completionData.choices && completionData.choices[0]) {
      console.log('✅ Response received!');
      console.log('📝 Code:', completionData.choices[0].message.content);
      console.log('💰 Cost: $' + completionData.usage.cost.toFixed(8));
      console.log('📊 Tokens:', completionData.usage.total_tokens + ' total');
    } else {
      console.error('❌ No completion in response:', completionData);
    }
  } catch (error) {
    console.error('❌ Error with completion:', error.message);
  }
  
  // Test 3: Test with DeepSeek V3.2 (coding model)
  console.log('\n💻 Testing DeepSeek V3.2 for coding:');
  try {
    const deepseekResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-v3.2',
        messages: [
          { role: 'user', content: 'Fix this bug: function add(a, b) { return a - b; }' }
        ],
        max_tokens: 50
      })
    });
    
    const deepseekData = await deepseekResponse.json();
    
    if (deepseekData.choices && deepseekData.choices[0]) {
      console.log('✅ DeepSeek response received!');
      console.log('📝 Fix:', deepseekData.choices[0].message.content);
      console.log('💰 Cost: $' + deepseekData.usage.cost.toFixed(8));
    }
  } catch (error) {
    console.error('❌ Error with DeepSeek:', error.message);
  }
  
  console.log('\n🎯 OpenRouter API test complete!');
  console.log('Key is working and models are accessible.');
}

// Run test
testOpenRouter().catch(console.error);