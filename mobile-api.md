# Dog Translator Mobile API Documentation

**Base URL (Production):** `https://dog-translator-service-736369571076.us-east1.run.app`  
**Base URL (Local Dev):** `http://localhost:8000`

## Authentication

The mobile app uses JWT (JSON Web Token) based authentication. All V1 endpoints require authentication.

### Token Lifecycle
- Tokens are valid for **24 hours**
- Include the token in the `Authorization` header: `Bearer {token}`

---

## API Endpoints

### 1. Authentication

#### `POST /auth/login`
**Hybrid Login/Signup endpoint** - If the user doesn't exist, it creates a new account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "6db015d4b670403185...",
    "email": "user@example.com",
    "is_verified": true
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Response (400 Bad Request):**
```json
{
  "detail": "Incorrect password"
}
```

**Example (cURL):**
```bash
curl -X POST "https://dog-translator-service-736369571076.us-east1.run.app/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"test123"}'
```

---

#### `GET /api/v1/me`
Get the current authenticated user's information.

**Headers:**
- `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "sub": "user@example.com",
  "uid": "6db015d4b670403185..."
}
```

**Example (cURL):**
```bash
curl -X GET "https://dog-translator-service-736369571076.us-east1.run.app/api/v1/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 2. Dog Translation (Core Feature)

#### `POST /api/v1/interpret`
Upload a dog image and get Gemini's interpretation of the dog's body language.

**Headers:**
- `Authorization: Bearer {token}` *(Required)*
- `Content-Type: multipart/form-data`

**Form Data:**
- `image` (file, required): JPEG or PNG image of a dog
- `tone` (string, optional): Interpretation tone. Options:
  - `playful` - Excited, happy, short responses with exclamation marks
  - `calm` - Zen, soothing, relaxed tone
  - `trainer` - Analytical, educational explanation of body signals
  - Default: Neutral
- `save` (boolean, optional): Whether to save the interpretation for sharing. Default: `false`

**Response (200 OK):**
```json
{
  "status": "ok",
  "explanation": "I am resting! It's so cozy here! I'm super relaxed and happy! Maybe I'll get a treat!",
  "confidence": 0.95,
  "breed": "Golden Retriever",
  "source": "vertex_gemini",
  "share_id": "a1b2c3d4..." // Only if save=true
}
```

**Response (502 Bad Gateway):**
```json
{
  "status": "error",
  "explanation": "Unable to interpret the image right now.",
  "confidence": 0.0,
  "error": "upstream_failure"
}
```

**Example (cURL):**
```bash
curl -X POST "https://dog-translator-service-736369571076.us-east1.run.app/api/v1/interpret" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "image=@dog_photo.jpg" \
  -F "tone=playful" \
  -F "save=true"
```

**Example (JavaScript/React Native):**
```javascript
const formData = new FormData();
formData.append('image', {
  uri: imageUri,
  type: 'image/jpeg',
  name: 'dog.jpg',
});
formData.append('tone', 'playful');
formData.append('save', 'true');

const response = await fetch('https://dog-translator-service-736369571076.us-east1.run.app/api/v1/interpret', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
  body: formData,
});

const result = await response.json();
console.log(result.explanation);
```

---


---

### 3. Education & Explanation (New)

#### `POST /api/v1/explain`
Get a detailed explanation of the body language and fetched educational resources.

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "translation": "I am excited and happy to see you!",
  "breed": "Golden Retriever" // Optional
}
```

**Response (200 OK):**
```json
{
  "explanation": "The tail wagging widely at mid-height typically indicates a friendly and happy dog. Soft eyes and a relaxed mouth are also key signs of affection.",
  "links": [
    {
      "title": "How to Read Dog Body Language - AKC",
      "url": "https://www.akc.org/expert-advice/advice/how-to-read-dog-body-language/"
    },
    {
      "title": "7 Dog Tail Positions and What They Mean",
      "url": "https://www.petmd.com/dog/behavior/tail-wagging-meaning"
    }
  ]
}
```

---

### 4. Sharing

#### `GET /api/share/{share_id}`
Retrieve a shared interpretation by its ID (JSON format).

**Response (200 OK):**
```json
{
  "id": "a1b2c3d4...",
  "explanation": "I am resting!...",
  "confidence": 0.95,
  "created_at": "2025-12-29T18:30:00"
}
```

**Response (404 Not Found):**
```json
{
  "detail": "Not found"
}
```

**Example (cURL):**
```bash
curl -X GET "https://dog-translator-service-736369571076.us-east1.run.app/api/share/a1b2c3d4..."
```

---

#### `GET /share/{share_id}`
Retrieve a shared interpretation by its ID (HTML format for web viewing).

**Response:** HTML page with the interpretation

---

### 5. Utility

#### `GET /health`
Health check endpoint to verify the API is running.

**Response (200 OK):**
```json
{
  "status": "ok"
}
```

---

#### `GET /api/registry`
Returns a structured JSON document describing all available endpoints.

**Response (200 OK):**
```json
{
  "service": {
    "name": "Dog Body Language Interpreter",
    "version": "1.1"
  },
  "endpoints": [...]
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (invalid email/password, incorrect format) |
| 401 | Unauthorized (missing or invalid token) |
| 403 | Forbidden (no permission) |
| 404 | Not Found (share ID doesn't exist) |
| 413 | Payload Too Large (image exceeds 6MB) |
| 502 | Bad Gateway (Gemini API failure) |

---

## Rate Limits & Constraints

- **Max Image Size:** 6MB
- **Supported Formats:** JPEG, PNG
- **Token Expiry:** 24 hours
- **CORS:** Enabled for all origins (adjust in production)

---

## Mobile Integration Tips

### React Native Example
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://dog-translator-service-736369571076.us-east1.run.app';

// Login
async function login(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  await AsyncStorage.setItem('accessToken', data.access_token);
  return data;
}

// Interpret Dog Image
async function interpretDog(imageUri, tone = 'playful') {
  const token = await AsyncStorage.getItem('accessToken');
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'dog.jpg',
  });
  formData.append('tone', tone);
  formData.append('save', 'true');

  const response = await fetch(`${API_BASE}/api/v1/interpret`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  return await response.json();
}
```

---

## Next Steps for Mobile Development

1. **Implement Token Refresh**: Currently tokens last 24 hours. Consider implementing a refresh mechanism.
2. **Offline Support**: Cache interpretations locally using AsyncStorage or SQLite.
3. **Image Optimization**: Compress images on the client side before uploading to reduce bandwidth.
4. **Error Handling**: Implement retry logic for network failures.
5. **Analytics**: Track interpretation requests and user engagement.

---

## Support

For issues or questions, refer to the [GitHub repository](https://github.com/your-repo/dog-translator).
