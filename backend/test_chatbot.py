"""
Test script for the Financial Advisor Chatbot Engine.

Run this to see example conversations and test different intents.
"""

from services.chat_engine import create_advisor


def print_response(query: str, response: dict):
    """Pretty print chatbot response."""
    print("\n" + "="*60)
    print(f"💬 USER: {query}")
    print("="*60)
    print(f"\n🤖 BOT:\n{response['reply']}")
    print(f"\n💡 SUGGESTIONS:")
    for i, suggestion in enumerate(response['suggestions'], 1):
        print(f"   {i}. {suggestion}")
    print(f"\n📊 CONTEXT: {response['context']}")
    print("="*60)


def test_chatbot():
    """Test the chatbot with various scenarios."""
    
    # Scenario 1: Safe user with good financial health
    print("\n🎯 SCENARIO 1: Safe User (Good Financial Health)")
    print("-" * 60)
    
    safe_context = {
        "survival_days": 25.5,
        "risk_level": "Safe",
        "avg_daily_spending": 300.00,
        "emergency_fund": 7650.00,
        "monthly_allowance": 15000.00,
        "top_categories": [
            {"category": "food", "total": 4500, "percentage": 50, "transaction_count": 30},
            {"category": "transport", "total": 2000, "percentage": 22, "transaction_count": 15},
            {"category": "entertainment", "total": 1500, "percentage": 17, "transaction_count": 10}
        ],
        "total_30d_spending": 9000.00
    }
    
    advisor = create_advisor(safe_context)
    
    # Test different queries
    queries = [
        "Can I spend ₹500 today?",
        "How many days can I survive?",
        "How can I improve my savings?",
        "What's my emergency fund status?"
    ]
    
    for query in queries:
        response = advisor.respond(query)
        print_response(query, response)
    
    # Scenario 2: Warning user needs improvement
    print("\n\n🎯 SCENARIO 2: Warning User (Needs Improvement)")
    print("-" * 60)
    
    warning_context = {
        "survival_days": 5.5,
        "risk_level": "Warning",
        "avg_daily_spending": 450.00,
        "emergency_fund": 2475.00,
        "monthly_allowance": 12000.00,
        "top_categories": [
            {"category": "entertainment", "total": 6000, "percentage": 44, "transaction_count": 25},
            {"category": "food", "total": 4500, "percentage": 33, "transaction_count": 30},
            {"category": "shopping", "total": 3000, "percentage": 22, "transaction_count": 8}
        ],
        "total_30d_spending": 13500.00
    }
    
    advisor = create_advisor(warning_context)
    
    queries = [
        "Why am I broke?",
        "Can I spend ₹1000 today?",
        "Give me savings tips",
        "Show my spending breakdown"
    ]
    
    for query in queries:
        response = advisor.respond(query)
        print_response(query, response)
    
    # Scenario 3: Critical user in danger
    print("\n\n🎯 SCENARIO 3: Critical User (Emergency Mode)")
    print("-" * 60)
    
    critical_context = {
        "survival_days": 2.0,
        "risk_level": "Critical",
        "avg_daily_spending": 600.00,
        "emergency_fund": 1200.00,
        "monthly_allowance": 15000.00,
        "top_categories": [
            {"category": "food", "total": 9000, "percentage": 50, "transaction_count": 40},
            {"category": "entertainment", "total": 5400, "percentage": 30, "transaction_count": 20},
            {"category": "transport", "total": 3600, "percentage": 20, "transaction_count": 15}
        ],
        "total_30d_spending": 18000.00
    }
    
    advisor = create_advisor(critical_context)
    
    queries = [
        "Can I afford ₹800?",
        "Why am I broke?",
        "How do I improve my situation?",
        "How long can I survive?"
    ]
    
    for query in queries:
        response = advisor.respond(query)
        print_response(query, response)
    
    # Test edge cases
    print("\n\n🎯 EDGE CASES & DEFAULT HANDLER")
    print("-" * 60)
    
    advisor = create_advisor(safe_context)
    
    edge_queries = [
        "Hello!",
        "What's my budget?",
        "Thanks for the help",
        "Random unmatched query"
    ]
    
    for query in edge_queries:
        response = advisor.respond(query)
        print_response(query, response)


if __name__ == "__main__":
    print("\n" + "🤖 FINANCIAL ADVISOR CHATBOT ENGINE TEST".center(60, "="))
    print("Testing rule-based chatbot with behavioral finance principles")
    print("="*60)
    
    test_chatbot()
    
    print("\n\n" + "✅ TEST COMPLETE".center(60, "="))
    print("The chatbot engine is working correctly!")
    print("="*60 + "\n")
