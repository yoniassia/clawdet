# Feedback System

User feedback widget implemented across ClawDet, inspired by ClawX open-source implementation.

## Features

### User-Facing
- **Floating button** (💬) fixed to bottom-right on all pages
- **Modal interface** with:
  - 5-star rating system (⭐)
  - Category dropdown (🐛 Bug, ✨ Feature, 🎨 UX, 💙 Praise, 💬 Other)
  - Text message field
  - Submit button
- **Toast notification** on successful submission
- **Keyboard support** (Escape to close)
- **X-style dark theme** (blue accents on black)

### Backend
- JSON file storage (`data/feedback.json`)
- Auto-detects user from session or marks as 'anonymous'
- Stores: user, page, rating, category, message, timestamp, user-agent
- Admin API for viewing feedback + stats

## Usage

### For Users
1. Click the 💬 button (bottom-right corner)
2. Rate your experience (1-5 stars)
3. Select a category
4. (Optional) Add a message
5. Click "Submit Feedback"
6. Get instant confirmation toast

### For Admins

**View all feedback:**
```bash
curl https://clawdet.com/api/feedback?token=clawdet-admin
```

**Response includes:**
```json
{
  "feedback": [...],
  "count": 50,
  "total": 123,
  "stats": {
    "total": 123,
    "averageRating": 4.2,
    "byCategory": {
      "bug": 15,
      "feature": 40,
      "ux": 20,
      "praise": 30,
      "other": 18
    },
    "byRating": {
      "5": 60,
      "4": 35,
      "3": 15,
      "2": 8,
      "1": 5
    }
  }
}
```

**Pagination:**
```bash
curl "https://clawdet.com/api/feedback?token=clawdet-admin&limit=10&offset=0"
```

**Set admin token in production:**
```bash
# Add to .env.local
ADMIN_TOKEN=your-secure-random-token-here

# Then use:
curl https://clawdet.com/api/feedback?token=your-secure-random-token-here
```

## Files

### Frontend
- `components/FeedbackWidget.tsx` (11KB)
  - React component with modal UI
  - State management (rating, category, message)
  - Inline styles for X-style theme
  - Animations (slideUp, fadeIn)

### Backend
- `app/api/feedback/route.ts` (4.5KB)
  - POST `/api/feedback` - Submit feedback
  - GET `/api/feedback?token=xxx` - View feedback (admin)
  - JSON file storage
  - User detection from session cookie

### Integration
- `app/layout.tsx` - Added `<FeedbackWidget />` to root layout
  - Available on all pages automatically
  - No per-page configuration needed

### Data Storage
- `data/feedback.json` - All feedback entries
  - Created automatically on first submission
  - Format: Array of feedback objects
  - Sorted by timestamp (newest first)

## Design

### Colors (X-style Dark Theme)
- Background: `rgba(0, 0, 0, 0.95)`
- Primary: `#1DA1F2` (Twitter blue)
- Borders: `rgba(29, 161, 242, 0.15-0.4)` (semi-transparent blue)
- Text: `white` / `#8899A6` (gray)

### Positioning
- Floating button: `bottom: 1.5rem; right: 1.5rem`
- Modal: `bottom-right` with padding for button clearance
- Toast: `bottom: 5rem; right: 5.5rem` (above button)

### Animations
```css
@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Interactions
- **Hover**: Button scales to 1.05, brightens
- **Click**: Button scales to 0.95
- **Focus**: Input borders change to blue
- **Disabled**: Opacity 0.3, cursor not-allowed

## Testing

### Manual Test
1. Visit any page on https://clawdet.com
2. Click floating 💬 button (bottom-right)
3. Select 4 stars
4. Choose "💙 Love it!" category
5. Type: "Great product!"
6. Click "Submit Feedback"
7. See toast: "Thanks for your feedback! 💙"

### API Test
```bash
# Submit feedback (simulate user)
curl -X POST https://clawdet.com/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "page": "/dashboard",
    "rating": 5,
    "category": "praise",
    "message": "Amazing experience!"
  }'

# View feedback (admin)
curl https://clawdet.com/api/feedback?token=clawdet-admin | jq .
```

### Dev Test (Local)
```bash
cd /root/.openclaw/workspace/clawdet
npm run dev

# Open: http://localhost:3001
# Test feedback widget
# Check: data/feedback.json
```

## Analytics

### Key Metrics to Track
- **Response rate**: % of users who submit feedback
- **Average rating**: Overall satisfaction score
- **Top categories**: What users care about most
- **Sentiment by page**: Which pages get best/worst ratings
- **Anonymous vs logged-in**: Do authenticated users rate differently?

### Queries
```bash
# Average rating
jq '[.[] | .rating] | add / length' data/feedback.json

# Top category
jq 'group_by(.category) | map({category: .[0].category, count: length}) | sort_by(.count) | reverse' data/feedback.json

# Recent negative feedback (1-2 stars)
jq '[.[] | select(.rating <= 2)] | sort_by(.createdAt) | reverse | .[0:10]' data/feedback.json
```

## Migration Path

### Current: JSON File Storage
- ✅ Simple, no database setup
- ✅ Easy to read/debug
- ⚠️ Limited scale (~10k entries)
- ⚠️ No concurrent write safety

### Future: PostgreSQL
When migrating to PostgreSQL:

```sql
CREATE TABLE user_feedback (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  page VARCHAR(500),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category VARCHAR(50),
  message TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_feedback_user ON user_feedback(user_id);
CREATE INDEX idx_feedback_rating ON user_feedback(rating);
CREATE INDEX idx_feedback_created ON user_feedback(created_at DESC);
```

Update `app/api/feedback/route.ts` to use database queries instead of JSON file operations.

## Best Practices

### For Product Development
1. **Review feedback weekly** - Don't let it pile up
2. **Respond to critical bugs** - Especially 1-2 star ratings
3. **Track trends** - Are ratings improving over time?
4. **Close the loop** - Implement requested features, announce fixes

### For Users
1. **Acknowledge all feedback** - Even if just "Thanks!"
2. **Be specific in responses** - "Fixed in v1.2" not just "Fixed"
3. **Public changelog** - Show you're listening
4. **Feature voting** - Let users upvote requests

## Roadmap

### Phase 1 (Current) ✅
- Basic feedback widget
- JSON file storage
- Admin view API

### Phase 2 (Near-term)
- [ ] Email notifications for feedback
- [ ] Slack/Discord webhook integration
- [ ] Public feedback board (optional)
- [ ] Upvoting feature requests

### Phase 3 (Future)
- [ ] Migrate to PostgreSQL
- [ ] Advanced analytics dashboard
- [ ] A/B test feedback prompts
- [ ] NPS score tracking
- [ ] Sentiment analysis (AI)

---

**Deployed:** 2026-02-17  
**Live at:** https://clawdet.com (all pages)  
**Based on:** ClawX open-source implementation  
**Theme:** X-style dark (blue on black)
