"""
Simple API test script for Emergency Buffer Builder.

Run this after starting the server to verify all endpoints are working.
"""

import requests
import json
from datetime import date

BASE_URL = "http://localhost:8000/api/v1"

def test_health_check():
    """Test health check endpoint."""
    print("\n🔍 Testing health check...")
    response = requests.get("http://localhost:8000/")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200
    print("✅ Health check passed!")

def test_register():
    """Test user registration."""
    print("\n🔍 Testing user registration...")
    data = {
        "name": "Test User",
        "email": f"test{date.today().strftime('%Y%m%d')}@example.com",
        "password": "password123",
        "monthly_allowance": 15000
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 201:
        print("✅ Registration successful!")
        return response.json()["access_token"]
    elif response.status_code == 400 and "already registered" in response.json()["detail"]:
        print("⚠️ User already exists, trying login...")
        return test_login(data["email"], data["password"])
    else:
        print("❌ Registration failed!")
        return None

def test_login(email=None, password=None):
    """Test user login."""
    print("\n🔍 Testing user login...")
    if not email:
        email = f"test{date.today().strftime('%Y%m%d')}@example.com"
        password = "password123"
    
    data = {
        "email": email,
        "password": password
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        token = response.json()["access_token"]
        print("✅ Login successful!")
        return token
    else:
        print(f"❌ Login failed: {response.json()}")
        return None

def test_add_transaction(token):
    """Test adding a transaction."""
    print("\n🔍 Testing add transaction...")
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "amount": -250.50,
        "category": "food",
        "description": "Lunch at cafe",
        "date": str(date.today())
    }
    response = requests.post(f"{BASE_URL}/transactions", json=data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 201:
        print("✅ Transaction added!")
        return response.json()["id"]
    else:
        print("❌ Failed to add transaction!")
        return None

def test_get_transactions(token):
    """Test getting transactions."""
    print("\n🔍 Testing get transactions...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/transactions?limit=10", headers=headers)
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Total transactions: {data['total_count']}")
    print(f"Returned: {len(data['transactions'])} transactions")
    
    if response.status_code == 200:
        print("✅ Transactions retrieved!")
    else:
        print("❌ Failed to get transactions!")

def test_emergency_fund(token):
    """Test emergency fund operations."""
    print("\n🔍 Testing emergency fund...")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get fund
    response = requests.get(f"{BASE_URL}/emergency-fund", headers=headers)
    print(f"Get fund status: {response.status_code}")
    print(f"Current fund: {response.json()}")
    
    # Deposit
    deposit_data = {"amount": 5000, "lock_days": 0}
    response = requests.post(f"{BASE_URL}/emergency-fund/deposit", json=deposit_data, headers=headers)
    print(f"\nDeposit status: {response.status_code}")
    print(f"After deposit: {response.json()}")
    
    if response.status_code == 200:
        print("✅ Emergency fund operations successful!")
    else:
        print("❌ Emergency fund operations failed!")

def test_dashboard(token):
    """Test dashboard insights."""
    print("\n🔍 Testing dashboard insights...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/dashboard/insights", headers=headers)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n📊 Dashboard Insights:")
        print(f"  • Avg daily spending: ₹{data['avg_daily_spending']}")
        print(f"  • Survival days: {data['survival_days']}")
        print(f"  • Risk level: {data['risk_level']}")
        print(f"  • Emergency fund: ₹{data['emergency_fund']}")
        print(f"  • Fund progress: {data['fund_progress_percent']}%")
        print("✅ Dashboard insights retrieved!")
    else:
        print("❌ Failed to get dashboard insights!")

def test_chatbot(token):
    """Test chatbot."""
    print("\n🔍 Testing chatbot...")
    headers = {"Authorization": f"Bearer {token}"}
    
    messages = [
        "Can I spend ₹500 today?",
        "What's my risk level?",
        "How many days can I survive?"
    ]
    
    for msg in messages:
        print(f"\n💬 User: {msg}")
        data = {"message": msg}
        response = requests.post(f"{BASE_URL}/chatbot/message", json=data, headers=headers)
        
        if response.status_code == 200:
            reply = response.json()["reply"]
            print(f"🤖 Bot: {reply[:200]}...")
        else:
            print(f"❌ Chatbot error: {response.json()}")
    
    print("\n✅ Chatbot test complete!")

def run_all_tests():
    """Run all API tests."""
    print("=" * 60)
    print("🚀 Emergency Buffer Builder - API Test Suite")
    print("=" * 60)
    
    try:
        # Test health check
        test_health_check()
        
        # Test authentication
        token = test_register()
        if not token:
            print("\n❌ Cannot proceed without authentication token!")
            return
        
        # Test transactions
        test_add_transaction(token)
        test_get_transactions(token)
        
        # Test emergency fund
        test_emergency_fund(token)
        
        # Test dashboard
        test_dashboard(token)
        
        # Test chatbot
        test_chatbot(token)
        
        print("\n" + "=" * 60)
        print("✅ All tests completed!")
        print("=" * 60)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Cannot connect to server!")
        print("Make sure the server is running at http://localhost:8000")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    run_all_tests()
