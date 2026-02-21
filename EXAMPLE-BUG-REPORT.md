# Example Bug Report - For QA Review

This is a **fake bug report** to demonstrate the format and level of detail we expect. Please review this example and confirm if this meets your requirements.

---

## Bug #EXAMPLE-001: Trial chat shows wrong message count in UI

**Severity**: Medium  
**Priority**: P2  
**Status**: New (Example Only)  
**Found In**: https://clawdet.com/trial  
**Tested On**: Chrome 120.0.6099.109, Windows 11  
**Reported By**: QA Team (Example)  
**Date**: 2026-02-19

### Description
The trial chat interface displays "Message 4 of 5" when the user has only sent 3 messages. The counter is off by one, which may confuse users about how many messages they have remaining.

### Steps to Reproduce
1. Open https://clawdet.com in a fresh incognito window
2. Click "Try It Now" button
3. Send message #1: "Hello"
4. Observe message counter in UI (should say "1 of 5")
5. Send message #2: "How are you?"
6. Observe message counter now says "3 of 5" (incorrect - should be "2 of 5")
7. Send message #3: "Tell me a joke"
8. Counter now shows "4 of 5" (incorrect - should be "3 of 5")

### Expected Result
- After message 1: Counter displays "1 of 5"
- After message 2: Counter displays "2 of 5"
- After message 3: Counter displays "3 of 5"
- After message 4: Counter displays "4 of 5"
- After message 5: Counter displays "5 of 5" and blocks further messages

### Actual Result
The counter is consistently off by one:
- After message 1: Shows "2 of 5" ❌
- After message 2: Shows "3 of 5" ❌
- After message 3: Shows "4 of 5" ❌
- After message 4: Shows "5 of 5" ❌
- After message 5: Shows "Trial limit reached" ✅ (this part works correctly)

**Note**: The actual limit enforcement works correctly (blocks after 5 messages), only the UI counter is wrong.

### Screenshots

**Screenshot 1**: After sending first message  
![Message counter showing 2 of 5 after first message](https://via.placeholder.com/800x400/1a1a1a/00aced?text=Screenshot+1:+Counter+shows+2/5+after+1+message)  
*Caption: Counter incorrectly shows "2 of 5" after user sent only 1 message*

**Screenshot 2**: After sending third message  
![Message counter showing 4 of 5 after third message](https://via.placeholder.com/800x400/1a1a1a/00aced?text=Screenshot+2:+Counter+shows+4/5+after+3+messages)  
*Caption: Counter incorrectly shows "4 of 5" after user sent only 3 messages*

**Screenshot 3**: Browser DevTools Console  
![Console showing message count](https://via.placeholder.com/800x600/1a1a1a/ff0000?text=Console:+messageCount=4+actualSent=3)  
*Caption: Console log reveals mismatch between internal counter and UI display*

### Console Errors
```javascript
trial-chat.js:87 Message sent: 1
trial-chat.js:142 Trial counter updated: 2/5
trial-chat.js:87 Message sent: 2
trial-chat.js:142 Trial counter updated: 3/5
trial-chat.js:87 Message sent: 3
trial-chat.js:142 Trial counter updated: 4/5
```

*Analysis*: The counter is incremented before the message is sent, causing the off-by-one error.

### Additional Context
- **User agent**: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`
- **Screen resolution**: 1920x1080
- **Network conditions**: WiFi, 150 Mbps, 12ms latency
- **Time of test**: 2026-02-19 15:45:33 UTC
- **Session ID**: `trial_abc123def456` (if logged)
- **Cookies**: None (incognito mode)
- **LocalStorage**: Checked - no trial state persisted

### Impact Assessment
- **User Confusion**: Medium - Users may think they have fewer messages remaining than they actually do
- **Functional Impact**: Low - The actual limit enforcement works correctly, only the UI is misleading
- **Workaround**: None needed - users can still complete trial successfully
- **Frequency**: 100% reproducible on every fresh session

### Proposed Fix
Check the message counter logic in `/app/trial/page.tsx` or `/app/api/trial-chat/route.ts`:

**Suspected Issue**:
```typescript
// Current (buggy):
setMessageCount(messageCount + 1)  // Incremented before send
await sendMessage(text)

// Should be:
await sendMessage(text)
setMessageCount(messageCount + 1)  // Increment after send
```

**Files to Check**:
1. `/app/trial/page.tsx` - Client-side counter logic
2. `/app/api/trial-chat/route.ts` - Server-side limit check
3. `/components/TrialChat.tsx` - UI component rendering counter

### Related Issues
- None found

### Regression Risk
Low - This is a UI-only issue. Fixing the counter logic should not affect the underlying trial limit enforcement.

---

## Feedback on This Example

**Question for QA Team**:  
Does this level of detail work for you? Should we include more/less information? Please let us know if you need:

- ✅ More screenshots
- ✅ Video recording of the bug
- ✅ Network traces (HAR files)
- ✅ Specific browser/OS combinations
- ✅ Performance metrics (page load times, etc.)

**How to Submit Your Test Bug Report**:
Please create a similar bug report (can be fake or real) and send it back to us via:
- GitHub Issue: https://github.com/yoniassia/clawdet/issues
- Email: yoni@etoro.com
- WhatsApp: (your preferred method)

We'll review your submission and confirm the format meets our needs before you begin full QA testing.

---

**Example Created**: 2026-02-19  
**Document Version**: 1.0  
**Status**: Awaiting QA Team Feedback
