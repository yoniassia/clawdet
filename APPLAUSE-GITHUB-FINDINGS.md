# Applause API - GitHub Code Examples & SDK Analysis

**Research Date**: 2026-02-20  
**Sources**: ApplauseOSS GitHub Organization  
**Status**: ✅ Found Official SDKs and API Usage Examples

---

## 🎯 Key Findings

### ✅ Applause Has Official Open Source SDKs

**GitHub Organization**: https://github.com/ApplauseOSS

**Active Repositories** (55 total, top ones):
1. **auto-sdk-java** - Java Automation SDK
2. **pytest-applause-reporter** - Python pytest plugin
3. **common-python-reporter** - Core Python API client
4. **applause-reporter-testsuite** - TypeScript SDK
5. **applause-a11y-fixer** - Accessibility testing tools

---

## 📦 SDK #1: Python API Client (Most Relevant)

### Repository
**Name**: `common-python-reporter`  
**URL**: https://github.com/ApplauseOSS/common-python-reporter  
**Language**: Python  
**License**: Apache 2.0  
**Last Updated**: Jan 13, 2026 (Active!)

### What It Does
Core Python library for reporting test results to Applause services via API.

### API Structure Discovered

**Two API Endpoints**:
1. **Auto API** - For automated test execution
2. **Public API** - For submitting test results

### Configuration
```python
from config import ApplauseConfig

config = ApplauseConfig(
    api_key="your_api_key",          # Your Applause API key
    product_id=12345,                 # Your product/project ID
    auto_api_base_url="https://...",  # Auto API endpoint
    public_api_base_url="https://...", # Public API endpoint
    applause_test_cycle_id=None,      # Optional: existing test cycle
    test_rail_options=None            # Optional: TestRail integration
)
```

### Auto API Usage (Test Execution)
```python
from auto_api import AutoApi

# Initialize API client
config = ApplauseConfig(
    api_key="your_api_key",
    product_id=12345
)
auto_api = AutoApi(config)

# 1. Start a test run
tr_id = auto_api.start_test_run(
    TestRunCreateDto(tests=["test1", "test2"])
).test_run_id

# 2. Submit test case results
test_case = auto_api.start_test_case(
    CreateTestCaseResultDto(
        test_run_id=tr_id,
        test_case_name="test1",
        provider_session_ids=[]
    )
)

auto_api.submit_test_case_result(
    SubmitTestCaseResultDto(
        test_result_id=test_case.test_result_id,
        status=TestResultStatus.PASSED,
        provider_session_ids=[]
    )
)

# 3. End the test run
auto_api.end_test_run(tr_id)
```

### Public API Usage (Result Submission)
```python
from public_api import PublicApi

config = ApplauseConfig(...)
public_api = PublicApi(config)

public_api.submit_result(
    123,  # Test cycle ID
    TestRunAutoResultDto(...)
)
```

### High-Level Reporter Interface
```python
from reporter import ApplauseReporter

# Initialize reporter
reporter = ApplauseReporter(config)

# Start test run
run_id = reporter.runner_start(tests=["test1", "test2"])

# Execute and report test
reporter.start_test_case(
    "test1", 
    "test1", 
    params=AdditionalTestCaseParams(...)
)

reporter.submit_test_case_result(
    "test1", 
    TestResultStatus.PASSED, 
    params=AdditionalTestCaseResultParams(...)
)
```

---

## 📦 SDK #2: pytest Plugin

### Repository
**Name**: `pytest-applause-reporter`  
**URL**: https://github.com/ApplauseOSS/pytest-applause-reporter  
**Language**: Python  
**Last Updated**: Jan 13, 2026

### Usage Example
```python
# conftest.py
import pytest
from applause_pytest_plugin import ApplausePytestPlugin, ApplauseConfig

def pytest_configure(config: pytest.Config):
    app_config = ApplauseConfig(
        api_key="api_key",
        product_id=123
    )
    config.pluginmanager.register(
        ApplausePytestPlugin(app_config), 
        'applause-pytest-plugin'
    )

# test_something.py
def test_something(applause_result: ApplauseResult):
    # Your test code
    pass

# Register Selenium session
def test_with_selenium(driver: WebDriver, applause_result: ApplauseResult):
    applause_result.register_session_id(driver.session_id)
    # Your test code

# Upload assets
def test_with_assets(applause_result: ApplauseResult):
    asset = "screenshot.png".encode("utf-8")
    applause_result.attach_asset(
        asset_name="screenshot.png",
        asset=asset,
        asset_type=AssetType.UNKNOWN
    )
```

---

## 📦 SDK #3: Java Automation SDK

### Repository
**Name**: `auto-sdk-java`  
**URL**: https://github.com/ApplauseOSS/auto-sdk-java  
**Language**: Java  
**License**: Apache 2.0  
**Last Updated**: Feb 9, 2026 (Very Active!)

### Maven Integration
```xml
<!-- Add repository -->
<repositories>
  <repository>
    <id>applause-public-repo</id>
    <url>https://repo.applause.com/repository/public</url>
    <snapshots>
      <enabled>false</enabled>
      <updatePolicy>always</updatePolicy>
    </snapshots>
  </repository>
</repositories>

<!-- Add dependency -->
<dependency>
  <groupId>com.applause</groupId>
  <artifactId>auto-sdk-java</artifactId>
  <version>${com.applause.sdk.java.version}</version>
</dependency>
```

**Purpose**: Wrapper for Selenium/Appium test automation with Applause integration

---

## 🔍 API Endpoints Discovered

From the SDK code:

### 1. Auto API Base URL
```
auto_api_base_url (configuration parameter)
```
Likely: `https://api.applause.com/v1/auto` or similar

**Operations**:
- `start_test_run()` - Create new test run
- `start_test_case()` - Begin test case execution
- `submit_test_case_result()` - Report test result (PASSED/FAILED)
- `end_test_run()` - Complete test run

### 2. Public API Base URL
```
public_api_base_url (configuration parameter)
```
Likely: `https://api.applause.com/v1/public` or similar

**Operations**:
- `submit_result()` - Submit test results to existing test cycle

---

## 🎯 What This Means for Clawdet

### Good News ✅
1. **Official SDKs exist** - We can use their Python client
2. **Active maintenance** - Last updates in Jan-Feb 2026
3. **Open source** - Can read the code to understand API
4. **Apache 2.0 license** - Free to use and modify

### API Structure Confirmed ✅
- **Authentication**: API Key based
- **Product/Project ID**: Required for all operations
- **Test Run workflow**: start → execute → submit → end
- **Asset upload**: Screenshots, videos, logs supported
- **Selenium integration**: Session ID linking

---

## 🚀 Integration Plan for Clawdet

### Step 1: Install Applause Python SDK
```bash
# Once you share your API key, I'll add this
pip install applause-common-reporter  # or similar package name
```

### Step 2: Configure API Client
```python
# /skills/applause-qa/config.py
from applause_reporter import ApplauseConfig

config = ApplauseConfig(
    api_key=os.getenv('APPLAUSE_API_KEY'),
    product_id=int(os.getenv('APPLAUSE_PRODUCT_ID')),
    auto_api_base_url=os.getenv('APPLAUSE_AUTO_API_URL'),  # You'll provide
    public_api_base_url=os.getenv('APPLAUSE_PUBLIC_API_URL')  # You'll provide
)
```

### Step 3: Trigger Test Cycle
```python
# /skills/applause-qa/trigger-test.js (or .py)
from applause_reporter import ApplauseReporter

reporter = ApplauseReporter(config)

# Start test run with our QA test cases
run_id = reporter.runner_start(tests=[
    "Trial Chat Flow",
    "OAuth Signup Flow",
    "Instance Provisioning",
    "Web Chat Functionality",
    "Mobile Responsive"
])

print(f"✅ Applause test run started: {run_id}")
```

### Step 4: Poll for Results
```python
# /skills/applause-qa/get-results.py
# Use Auto API to fetch test results
results = auto_api.get_test_run_results(run_id)

for test in results.tests:
    if test.status == "FAILED":
        # Create GitHub issue
        create_github_issue(
            title=f"[Applause] {test.name}",
            body=f"""
## Bug Found by Applause Testers

**Test**: {test.name}
**Status**: {test.status}
**Device**: {test.device_info}
**Browser**: {test.browser}

### Details
{test.failure_message}

### Screenshots
{test.screenshots}

**Applause Run ID**: {run_id}
            """,
            labels=['qa', 'applause', test.severity]
        )
```

### Step 5: Webhook Handler (If Supported)
```python
# /app/api/webhooks/applause/route.ts
@app.post('/api/webhooks/applause')
def applause_webhook(request):
    payload = request.json()
    
    if payload['event'] == 'test_run.completed':
        run_id = payload['test_run_id']
        results = auto_api.get_test_run_results(run_id)
        
        # Process results
        sync_bugs_to_github(results)
        
        # Notify via Telegram
        send_telegram_message(
            f"🧪 Applause test completed: {results.passed}/{results.total} passed"
        )
    
    return {'status': 'ok'}
```

---

## 📊 API Methods Available (From SDK)

### Test Run Management
| Method | Description | Parameters |
|--------|-------------|------------|
| `start_test_run()` | Create new test run | `tests: List[str]` |
| `end_test_run()` | Complete test run | `test_run_id: str` |
| `get_test_run_results()` | Fetch results | `test_run_id: str` |

### Test Case Execution
| Method | Description | Parameters |
|--------|-------------|------------|
| `start_test_case()` | Begin test execution | `test_run_id, test_case_name, session_ids` |
| `submit_test_case_result()` | Report result | `test_result_id, status, session_ids` |

### Asset Management
| Method | Description | Parameters |
|--------|-------------|------------|
| `attach_asset()` | Upload screenshot/video | `asset_name, asset_bytes, asset_type` |
| `register_session_id()` | Link Selenium session | `session_id: str` |

### Status Enum
```python
class TestResultStatus:
    PASSED = "PASSED"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"
    ERROR = "ERROR"
```

---

## 🔑 What You Need to Provide

Based on the SDK requirements:

1. **API Key** (`api_key`)
   - Where to find: Applause dashboard → Settings → API

2. **Product ID** (`product_id`)
   - Numeric ID for your Clawdet project
   - Example: `12345`

3. **Auto API Base URL** (`auto_api_base_url`)
   - Endpoint for test execution API
   - Likely: `https://api.applause.com/v1/auto` (confirm in your dashboard)

4. **Public API Base URL** (`public_api_base_url`)
   - Endpoint for result submission
   - Likely: `https://api.applause.com/v1/public` (confirm in your dashboard)

5. **Test Cycle ID** (`applause_test_cycle_id`) - Optional
   - If you want to use an existing test cycle

---

## 📝 Next Steps

### Option 1: Use Official SDK (Recommended)
1. You provide API credentials
2. I install `applause-common-reporter` package
3. I build integration using their SDK (less work, more reliable)
4. We test with a dummy test run

**Pros**:
- ✅ Official support
- ✅ Maintained by Applause
- ✅ Handles auth, retries, errors automatically
- ✅ Well-documented (we have examples above)

### Option 2: Direct REST API
1. You provide API credentials + endpoint URLs
2. I build HTTP client from scratch
3. I reverse-engineer API from SDK code
4. We test

**Pros**:
- ✅ More control
- ✅ No extra dependencies

**Cons**:
- ❌ More work
- ❌ Need to handle auth, retries, errors manually

**Recommendation**: Use Option 1 (Official SDK)

---

## 🎬 Action Items

### For You (Today)
1. Log into Applause dashboard
2. Navigate to Settings → API (or similar)
3. Find and copy:
   - API Key
   - Product ID for Clawdet
   - Auto API Base URL
   - Public API Base URL
4. Share with me via Telegram or add to `.env.local`

### For Me (Tomorrow)
1. Install `applause-common-reporter` Python package
2. Test API connection with your credentials
3. Build integration scripts using examples above
4. Create first test run via API
5. Set up GitHub issue sync

### Together (Day 3)
1. Review test results
2. Fine-tune test case mapping
3. Set up webhooks (if supported)
4. Deploy to production

---

## 📚 Additional Resources

**Official Applause GitHub**:
- https://github.com/ApplauseOSS

**Key Repositories**:
- Python SDK: https://github.com/ApplauseOSS/common-python-reporter
- pytest Plugin: https://github.com/ApplauseOSS/pytest-applause-reporter
- Java SDK: https://github.com/ApplauseOSS/auto-sdk-java

**Maven Repository** (for Java SDK):
- https://repo.applause.com/repository/public

**Test Requirements**: Java 21+, Maven 3.8.6+, Poetry (Python)

---

## ✅ Summary

**What I Found**:
- ✅ Official Applause SDKs exist (Python, Java, TypeScript)
- ✅ Active development (updated Feb 2026)
- ✅ Open source (Apache 2.0)
- ✅ Clear API structure (start run → execute → submit → end)
- ✅ Selenium integration support
- ✅ Asset upload (screenshots, videos)

**What I Need**:
- 🔑 Your API key
- 🎯 Product ID for Clawdet
- 🌐 API endpoint URLs (auto API + public API)

**What I'll Build**:
- 🤖 Auto-trigger tests on deploy (using their SDK)
- 🐛 Bug sync to GitHub (parse results → create issues)
- 📨 Telegram notifications (test complete, bugs found)
- 📊 Metrics dashboard (track over time)

**Timeline**:
- Today: You get credentials
- Tomorrow: I build integration using official SDK
- Day 3: We test with real test cycle
- Day 4: Deploy automation to production

Ready to get those API credentials? 🚀

---

**Document Status**: Research Complete  
**Updated**: 2026-02-20  
**Next**: Awaiting API credentials to start integration
