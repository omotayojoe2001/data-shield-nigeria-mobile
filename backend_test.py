import requests
import json
import time
from datetime import datetime

class SupabaseAPITester:
    def __init__(self):
        self.base_url = "https://atngqhvnzizufimblwmp.supabase.co"
        self.functions_url = f"{self.base_url}/functions/v1"
        self.auth_url = f"{self.base_url}/auth/v1"
        self.rest_url = f"{self.base_url}/rest/v1"
        self.api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0bmdxaHZueml6dWZpbWJsd21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MDA2NDIsImV4cCI6MjA2NDQ3NjY0Mn0.zIvBpKufApxcrrBuc3CXKR8jdH6DonzXwtDanIaw6bU"
        self.access_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_email = f"test.user.{int(time.time())}@gmail.com"
        self.test_password = "Test123456!"

    def run_test(self, name, func):
        """Run a test and track results"""
        self.tests_run += 1
        print(f"\n🔍 Testing: {name}")
        
        try:
            result = func()
            if result:
                self.tests_passed += 1
                print(f"✅ PASSED: {name}")
            else:
                print(f"❌ FAILED: {name}")
            return result
        except Exception as e:
            print(f"❌ ERROR: {name} - {str(e)}")
            return False

    def get_headers(self, with_auth=False):
        """Get request headers"""
        headers = {
            "apikey": self.api_key,
            "Content-Type": "application/json"
        }
        
        if with_auth and self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"
            
        return headers

    def test_signup(self):
        """Test user signup"""
        url = f"{self.auth_url}/signup"
        payload = {
            "email": self.test_email,
            "password": self.test_password,
            "data": {
                "full_name": "Test User"
            }
        }
        
        response = requests.post(url, headers=self.get_headers(), json=payload)
        data = response.json()
        
        if response.status_code == 200 and data.get("id"):
            self.user_id = data.get("id")
            print(f"  Created test user: {self.test_email}")
            return True
        else:
            print(f"  Signup failed: {json.dumps(data)}")
            return False

    def test_login(self):
        """Test user login"""
        url = f"{self.auth_url}/token?grant_type=password"
        payload = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        response = requests.post(url, headers=self.get_headers(), json=payload)
        data = response.json()
        
        if response.status_code == 200 and data.get("access_token"):
            self.access_token = data.get("access_token")
            print(f"  Login successful, got access token")
            return True
        else:
            print(f"  Login failed: {json.dumps(data)}")
            return False

    def test_get_user(self):
        """Test getting user data"""
        url = f"{self.auth_url}/user"
        
        response = requests.get(url, headers=self.get_headers(with_auth=True))
        data = response.json()
        
        if response.status_code == 200 and data.get("id") == self.user_id:
            print(f"  Got user data for: {data.get('email')}")
            return True
        else:
            print(f"  Get user failed: {json.dumps(data)}")
            return False

    def test_vpn_status(self):
        """Test VPN status endpoint"""
        url = f"{self.functions_url}/vpn-status"
        
        response = requests.get(url, headers=self.get_headers(with_auth=True))
        
        if response.status_code == 200:
            data = response.json()
            print(f"  VPN Status: {json.dumps(data)}")
            return data.get("success", False)
        else:
            print(f"  VPN status check failed: {response.status_code}")
            return False

    def test_create_vpn_key(self):
        """Test creating a VPN key"""
        url = f"{self.functions_url}/create-vpn-key"
        
        response = requests.post(url, headers=self.get_headers(with_auth=True))
        
        if response.status_code == 200:
            data = response.json()
            print(f"  Create VPN key response: {json.dumps(data)}")
            return data.get("success", False)
        else:
            print(f"  Create VPN key failed: {response.status_code}")
            return False

    def test_claim_daily_bonus(self):
        """Test claiming daily bonus"""
        url = f"{self.functions_url}/claim-daily-bonus"
        
        response = requests.post(url, headers=self.get_headers(with_auth=True))
        
        if response.status_code == 200:
            data = response.json()
            print(f"  Claim daily bonus response: {json.dumps(data)}")
            return data.get("success", False)
        else:
            print(f"  Claim daily bonus failed: {response.status_code}")
            return False

    def test_track_usage(self):
        """Test tracking VPN usage"""
        url = f"{self.functions_url}/track-usage"
        
        response = requests.post(url, headers=self.get_headers(with_auth=True))
        
        if response.status_code == 200:
            data = response.json()
            print(f"  Track usage response: {json.dumps(data)}")
            return data.get("success", False)
        else:
            print(f"  Track usage failed: {response.status_code}")
            return False

    def test_process_payment(self):
        """Test payment processing"""
        url = f"{self.functions_url}/process-payment"
        payload = {
            "amount": 1000  # 1000 naira
        }
        
        response = requests.post(url, headers=self.get_headers(with_auth=True), json=payload)
        
        if response.status_code == 200:
            data = response.json()
            print(f"  Process payment response: {json.dumps(data)}")
            return data.get("success", False)
        else:
            print(f"  Process payment failed: {response.status_code}")
            return False

    def test_referral_stats(self):
        """Test getting referral stats"""
        url = f"{self.functions_url}/referral-stats"
        
        response = requests.get(url, headers=self.get_headers(with_auth=True))
        
        if response.status_code == 200:
            data = response.json()
            print(f"  Referral stats response: {json.dumps(data)}")
            return data.get("success", False)
        else:
            print(f"  Referral stats failed: {response.status_code}")
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Supabase API Tests for GoodDeeds VPN")
        print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
        # Auth tests
        self.run_test("User Signup", self.test_signup)
        
        if self.user_id:
            self.run_test("User Login", self.test_login)
            
            if self.access_token:
                self.run_test("Get User Data", self.test_get_user)
                self.run_test("VPN Status", self.test_vpn_status)
                self.run_test("Create VPN Key", self.test_create_vpn_key)
                self.run_test("Claim Daily Bonus", self.test_claim_daily_bonus)
                self.run_test("Track Usage", self.test_track_usage)
                self.run_test("Process Payment", self.test_process_payment)
                self.run_test("Referral Stats", self.test_referral_stats)
        
        print("\n" + "=" * 60)
        print(f"📊 Tests Summary: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("✅ All tests passed!")
        else:
            print(f"❌ {self.tests_run - self.tests_passed} tests failed")
        
        return self.tests_passed == self.tests_run

if __name__ == "__main__":
    tester = SupabaseAPITester()
    tester.run_all_tests()