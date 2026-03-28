# AI Tutor Fix Specifications

## Functional Requirements

### Core Functionality
1. AI Tutor must send user messages to backend `/api/v1/ai/chat` endpoint
2. Backend must forward requests to NVIDIA API using configured credentials
3. AI Tutor must display actual AI-generated responses from NVIDIA API
4. System must handle cases where NVIDIA API is unavailable or returns errors
5. AI Tutor must maintain chat history in local storage for session persistence

### User Experience Requirements
1. Initial assistant message welcoming user and explaining capabilities
2. User input field with send button and Enter key support
3. Loading indicator during API requests
4. Error handling with user-friendly fallback messages
5. Messages displayed in chat bubbles with proper alignment (user right, assistant left)
6. Chat history persistence across page reloads using localStorage

### Context Awareness
1. AI Tutor should optionally receive current study module context
2. System prompts should be customizable based on user's study context
3. Responses should be encouraging, supportive, and educational in tone

## API Specifications

### Backend Endpoint: POST /api/v1/ai/chat
#### Request Format
```json
{
  "message": "string (user's question or message)",
  "context": {
    "currentModule": "string (optional, current study module)",
    "currentTopic": "string (optional, current topic being studied)"
  }
}
```

#### Success Response Format (200 OK)
```json
{
  "message": "string (AI-generated response from NVIDIA API)"
}
```

#### Error Response Formats
- **Missing API Key** (500 Internal Server Error):
  ```json
  {
    "message": "I'm here to help with your studies! However, the AI service is not configured. Please contact the administrator to set up the AI API key."
  }
  ```
  
- **API Connection Failure** (500 Internal Server Error):
  ```json
  {
    "message": "I'm having trouble connecting to the AI service right now. Please try again in a moment. 🔧"
  }
  ```

#### Authentication Requirements
- Requires valid JWT token in Authorization header: `Bearer <access_token>`
- Token validated by `authenticate` middleware
- Unauthorized requests return 401 Unauthorized

### NVIDIA API Integration
#### Request to NVIDIA API
- **Endpoint**: `https://integrate.api.nvidia.com/v1/chat/completions`
- **Method**: POST
- **Headers**:
  - `Authorization: Bearer <NVIDIA_API_KEY>`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "model": "nvidia/llama-3.1-nemotron-70b-instruct (or from AI_MODEL env)",
    "messages": [
      {
        "role": "system",
        "content": "System prompt defining AI tutor behavior"
      },
      {
        "role": "user",
        "content": "User's message"
      }
    ],
    "temperature": 0.8,
    "max_tokens": 500
  }
  ```

#### Response Handling
- Extract content from `response.data.choices[0].message?.content`
- If content is null/undefined, use fallback message
- Fallback message: "I'm here to help! Try asking about your current study topic or any concepts you're struggling with."

## Integration Specifications

### Frontend to Backend Communication
1. Frontend uses `aiService.chat()` method from `/client/src/services/aiService.ts`
2. Method sends POST request to `/ai/chat` (which becomes `/api/v1/ai/chat` via api.ts config)
3. Request includes `{ message, context }` payload
4. Response expects `{ message }` format
5. Loading state managed in TutorPage component
6. Error boundaries catch network/API errors and display fallback

### Backend to NVIDIA API Communication
1. Backend reads configuration from environment variables:
   - `NVIDIA_API_KEY` (required for NVIDIA provider)
   - `AI_MODEL` (optional, defaults to 'nvidia/llama-3.1-nemotron-70b-instruct')
2. Uses `getAIConfig()` function to determine provider (NVIDIA prioritized over OpenRouter)
3. Makes axios POST request to NVIDIA API endpoint with proper headers and body
4. Handles API errors with try/catch and returns appropriate fallback responses
5. Implements timeout and retry logic implicitly through axios defaults

### Environment Variables Required
#### Backend (Render deployment)
- `NVIDIA_API_KEY`: API key for NVIDIA NIM service
- `AI_MODEL`: Optional, model identifier for NVIDIA API (defaults to llama-3.1-nemotron-70b-instruct)

#### Frontend (Vercel build)
- `VITE_API_URL`: Base URL for backend API (no trailing slash)

### Data Flow
1. User types message in TutorPage input and clicks Send
2. TutorPage calls `aiService.chat({ message, context })`
3. aiService sends POST request via axios instance to `/api/v1/ai/chat`
4. Request interceptor adds JWT auth token from authStore
5. Backend route validates token via authenticate middleware
6. Backend calls `getAIConfig()` to get NVIDIA configuration
7. Backend validates API key exists
8. Backend constructs system prompt with optional context
9. Backend makes POST request to NVIDIA API with messages and parameters
10. NVIDIA API returns response with AI-generated content
11. Backend extracts message content and returns `{ message }` to frontend
12. Frontend updates chat state with assistant response
13. Frontend saves updated chat history to localStorage

## Test Scenarios

### Happy Path Tests
1. **Successful AI Response**
   - Given: User sends "Explain photosynthesis"
   - When: Backend successfully calls NVIDIA API
   - Then: Response contains actual AI-generated explanation of photosynthesis
   - And: Message is displayed in chat interface
   - And: Chat history is updated in localStorage

2. **Context-Aware Responses**
   - Given: User sends "Can you give me an example?" with context.currentModule="Biology"
   - When: Backend includes context in system prompt
   - Then: AI response references biology concepts appropriately

3. **Chat History Persistence**
   - Given: User exchanges 3 messages with AI tutor
   - When: User refreshes the page
   - Then: All 3 messages are restored from localStorage and displayed

### Error Case Tests
1. **Missing NVIDIA API Key**
   - Given: NVIDIA_API_KEY environment variable is not set
   - When: User sends any message to AI tutor
   - Then: Backend returns configured fallback message about AI service not being configured
   - And: Frontend displays this message to user

2. **NVIDIA API Connection Failure**
   - Given: Network prevents reaching NVIDIA API or API returns error
   - When: User sends message to AI tutor
   - Then: Backend catches error and returns connection failure fallback message
   - And: Frontend displays this message to user

3. **Invalid/Malformed NVIDIA Response**
   - Given: NVIDIA API returns unexpected response format
   - When: Backend attempts to extract message content
   - Then: Backend uses fallback message due to null/undefined content
   - And: Frontend displays fallback message to user

4. **Authentication Failure**
   - Given: User has invalid or expired JWT token
   - When: User attempts to send message to AI tutor
   - Then: Backend returns 401 Unauthorized
   - And: Frontend redirects to login page via axios interceptor

5. **Rate Limiting/Quota Exceeded**
   - Given: NVIDIA API returns 429 Too Many Requests
   - When: User sends message to AI tutor
   - Then: Backend catches error and returns connection failure fallback message
   - And: Frontend displays this message to user

### Edge Case Tests
1. **Empty Message Handling**
   - Given: User clicks Send with empty input
   - When: Form submission attempted
   - Then: Message is not sent (early return in handleSend)
   - And: No API call is made

2. **Very Long Messages**
   - Given: User sends message exceeding typical length limits
   - When: Backend forwards to NVIDIA API
   - Then: NVIDIA API handles truncation or returns error appropriately
   - And: System handles response gracefully

3. **Special Characters and Emojis**
   - Given: User sends message with special characters, emojis, or Unicode
   - When: Message is processed through the system
   - Then: Characters are properly encoded and transmitted
   - And: Response displays correctly in chat interface

### Performance Tests
1. **Response Time**
   - Given: Normal network conditions
   - When: User sends message to AI tutor
   - Then: Response is received within reasonable time (<5 seconds)
   - And: Loading indicator is displayed during wait time

2. **Concurrent Requests**
   - Given: User sends multiple messages rapidly
   - When: Multiple API requests are in flight
   - Then: System handles responses correctly and displays them in order
   - And: No message loss or duplication occurs