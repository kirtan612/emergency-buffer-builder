"""
Services package for Emergency Buffer Builder.

This package contains business logic, financial calculations, and chatbot engine.
"""

from .finance_logic import (
    calculate_insights,
    calculate_spending_by_category,
    get_spending_trend,
    check_spending_budget,
)

from .risk_engine import (
    calculate_risk_level,
    get_risk_message,
    get_risk_action_items,
)

from .chat_engine import (
    FinancialAdvisor,
    create_advisor,
)

__all__ = [
    "calculate_insights",
    "calculate_spending_by_category",
    "get_spending_trend",
    "check_spending_budget",
    "calculate_risk_level",
    "get_risk_message",
    "get_risk_action_items",
    "FinancialAdvisor",
    "create_advisor",
]
