# TapIn Admin Board

A clean, minimalistic admin board to trigger n8n workflows and preview affirmation/meditation results.

## Features

✨ **Interactive Experience**: Card-based selection instead of boring dropdowns
🔄 **Environment Toggle**: Switch between test and production n8n webhooks
📥 **Download Cards**: Export affirmations and meditations as high-quality images
🎨 **Beautiful Design**: Sage green and cream color palette with elegant typography
📱 **Responsive**: Works seamlessly on desktop and mobile devices
⚡ **Real-time Results**: Instant display of generated affirmations and meditations

## Architecture

### Backend (FastAPI)
- **Port**: 8001
- **Endpoints**:
  - `GET /api/health` - Health check
  - `POST /api/tapin/submit` - Submit form data to n8n webhook
- **Features**:
  - Environment-aware webhook routing (test/production)
  - CORS enabled for frontend communication
  - Error handling and timeout management

### Frontend (React)
- **Port**: 3000
- **Technology**: React 18 with Tailwind CSS
- **Key Libraries**:
  - `axios` - HTTP client
  - `html-to-image` - Download card functionality
  - `lucide-react` - Beautiful icons

## n8n Integration

### Webhooks
- **Test**: `https://dev-blc.app.n8n.cloud/webhook-test/tapintoaffirmations`
- **Production**: `https://dev-blc.app.n8n.cloud/webhook/tapintoaffirmations`

### Form Flow
1. **DB User Selection** - Choose character archetype
2. **Loop Identification** - What pattern are you stuck in?
3. **Current Feeling** - Emotional state
4. **Desired Feeling** - What you want to feel
5. **Protector Type** - Which protective part is active?
6. **Tool Choice** - Affirmation or Meditation?

### Response Format
```json
[
  {
    "affirmation": {
      "tool_type": "affirmation",
      "tool_text": "I am worthy...",
      "metadata": {
        "tags": ["worthiness", "grounding"],
        "start_phrase": "I am"
      }
    },
    "meditation": {
      "tool_type": "meditation",
      "tool_text": "Begin by settling...",
      "metadata": {
        "duration_sec": 195,
        "tags": ["grounding", "short-guided"]
      }
    }
  }
]
```

## Development

### Prerequisites
- Python 3.9+
- Node.js 16+
- Yarn

### Installation
```bash
# Backend
cd /app/backend
pip install -r requirements.txt

# Frontend
cd /app/frontend
yarn install
```

### Running Services
```bash
# Start all services
sudo supervisorctl restart all

# Check status
sudo supervisorctl status

# View logs
tail -f /var/log/supervisor/backend.out.log
tail -f /var/log/supervisor/frontend.out.log
```

### Testing
```bash
# Test backend health
curl http://localhost:8001/api/health

# Access frontend
open http://localhost:3000
```

## User Interface

### Color Palette
- **Sage Green** (#8B9B7E): Primary brand color
- **Cream** (#F5F1E8): Background and cards
- **Dark Green** (#2C3E2F): Text and buttons
- **Beige**: Accent colors

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)

### Key Components
1. **Environment Toggle**: Switch between test/production
2. **Progress Bar**: Visual feedback of form completion
3. **Card Selection**: Interactive cards with hover effects
4. **Results Display**: Beautiful gradient cards for affirmations/meditations
5. **Download Buttons**: High-quality PNG export

## Features in Detail

### Interactive Form
- No boring dropdowns - all selections use beautiful cards
- Auto-advance after selection
- Progress indicator shows completion percentage
- Previous/Next navigation with validation

### Response Display
- Separate cards for affirmation and meditation
- Gradient backgrounds with white overlay for text
- Tag display from metadata
- Duration indicator for meditations
- Scrollable content for long meditations

### Download Functionality
- Downloads cards as high-quality PNG images (2x pixel ratio)
- Preserves all styling and gradients
- Separate download for affirmation and meditation
- Filename: `affirmation.png` / `meditation.png`

## Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017/tapin_db
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

## API Reference

### POST /api/tapin/submit
Submit form data to n8n webhook.

**Request Body:**
```json
{
  "environment": "test",
  "formData": {
    "dbUser": "1/Kumararaja (DeservingOne)",
    "loop": "Too Much on My Plate",
    "feeling": "Overwhelmed",
    "wantedFeeling": "Worthy",
    "protector": "The Inner Critic",
    "toolChoice": "Affirmation"
  }
}
```

**Response:**
Returns the n8n webhook response containing affirmation/meditation data.

## Future Enhancements

- [ ] Add authentication for admin access
- [ ] Store submission history in MongoDB
- [ ] Add more customization options for affirmations
- [ ] Support for audio generation of meditations
- [ ] Export multiple formats (PDF, Audio)
- [ ] Analytics dashboard for submission trends

## License

Proprietary - TapIn Project
