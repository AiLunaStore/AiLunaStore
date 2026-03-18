// OpenRouter API Client for Integrated Agent System
// IMPORTANT: Never hardcode API keys. Use environment variables.
// Set OPENROUTER_API_KEY in your .env file
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  console.warn('⚠️ OPENROUTER_API_KEY not set in environment. Using simulation mode.');
}
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';

class OpenRouterClient {
  constructor() {
    this.apiKey = OPENROUTER_API_KEY;
    this.hasValidKey = !!this.apiKey && !this.apiKey.includes('example') && this.apiKey.length > 20;
    
    this.headers = {
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://mission-control.openclaw.ai',
      'X-Title': 'Mission Control Agent System'
    };
    
    if (this.hasValidKey) {
      this.headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
  }

  async executeTask(task, model) {
    console.log(`🤖 Executing task with ${model}: ${task.description.substring(0, 50)}...`);
    
    // Check if we have a valid API key
    if (!this.hasValidKey) {
      console.log(`   ⚠️ No valid OpenRouter API key configured. Using simulation mode.`);
      return this.simulateTask(task, model, 'No API key configured');
    }
    
    const messages = [
      { role: 'system', content: 'You are a helpful AI assistant. Provide concise, accurate responses.' },
      { role: 'user', content: task.description }
    ];

    const payload = {
      model: model,
      messages: messages,
      max_tokens: task.max_tokens || 500,
      temperature: task.temperature || 0.7,
      stream: false
    };

    try {
      const startTime = Date.now();
      const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      const endTime = Date.now();
      const duration = endTime - startTime;

      if (data.error) {
        console.error(`❌ OpenRouter API error: ${data.error.message} (code: ${data.error.code})`);
        
        // If key is invalid/revoked, switch to simulation
        if (data.error.code === 401) {
          console.warn(`   🔒 API key appears invalid/revoked. Switching to simulation mode.`);
          this.hasValidKey = false;
        }
        
        throw new Error(`OpenRouter API error: ${data.error.message}`);
      }

      if (!data.choices || !data.choices[0]) {
        throw new Error('No completion in response');
      }

      const result = {
        content: data.choices[0].message.content,
        model: model,
        usage: data.usage || {},
        cost: data.usage?.cost || 0,
        duration: duration,
        success: true,
        realApi: true
      };

      console.log(`✅ Task completed in ${duration}ms, cost: $${result.cost.toFixed(8)}`);
      return result;

    } catch (error) {
      console.error(`❌ OpenRouter API error for ${model}:`, error.message);
      
      // Fallback to simulation if API fails
      return this.simulateTask(task, model, error.message);
    }
  }

  simulateTask(task, model, errorReason = 'API unavailable') {
    console.log(`🔄 Simulating task for ${model} (${errorReason})`);
    
    // Simple simulation for demo purposes
    const simulations = {
      'minimax/minimax-m2.7': `# Python Fibonacci function (simulated - MiniMax M2.7)
def fibonacci(n):
    """Calculate Fibonacci sequence up to n."""
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    
    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])
    return sequence

# Example usage
print(fibonacci(10))  # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]`,
      
      'google/gemini-2.5-flash-lite': `// JavaScript Fibonacci (simulated - Gemini Flash)
function fibonacci(n) {
  const seq = [0, 1];
  for (let i = 2; i < n; i++) {
    seq.push(seq[i-1] + seq[i-2]);
  }
  return seq.slice(0, n);
}`,
      
      'deepseek/deepseek-v3.2': `// C++ Fibonacci (simulated - DeepSeek V3.2)
#include <vector>
#include <iostream>

std::vector<int> fibonacci(int n) {
    std::vector<int> result;
    if (n <= 0) return result;
    
    int a = 0, b = 1;
    for (int i = 0; i < n; i++) {
        result.push_back(a);
        int temp = a + b;
        a = b;
        b = temp;
    }
    return result;
}`
    };

    const content = simulations[model] || `Task completed by ${model} (simulated): ${task.description}`;
    
    return {
      content: content,
      model: model,
      usage: { total_tokens: 100, prompt_tokens: 50, completion_tokens: 50 },
      cost: 0.0001, // Simulated cost
      duration: 500,
      success: true,
      simulated: true,
      errorReason: errorReason
    };
  }

  async getAvailableModels() {
    try {
      const response = await fetch(`${OPENROUTER_API_URL}/models`, {
        headers: this.headers
      });
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching models:', error.message);
      
      // Return simulated models if API fails
      return [
        { id: 'minimax/minimax-m2.7', name: 'MiniMax M2.7', context_length: 204800 },
        { id: 'google/gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite', context_length: 1000000 },
        { id: 'deepseek/deepseek-v3.2', name: 'DeepSeek V3.2', context_length: 64000 },
        { id: 'google/gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview', context_length: 1000000 },
        { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', context_length: 200000 }
      ];
    }
  }

  async testConnection() {
    try {
      const response = await fetch(`${OPENROUTER_API_URL}/auth/key`, {
        headers: this.headers
      });
      
      const data = await response.json();
      return { success: !data.error, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default OpenRouterClient;