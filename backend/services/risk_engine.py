"""
Risk assessment engine for Emergency Buffer Builder.

This module provides functions to calculate risk levels, generate risk messages,
and provide actionable recommendations based on financial health metrics.
"""

from typing import List
from decimal import Decimal


def calculate_risk_level(survival_days: float) -> str:
    """
    Calculate risk level based on survival days.
    
    Risk levels are determined by how many days a user can survive
    with their current emergency fund and spending rate:
    - Critical: 0-3 days (immediate danger)
    - Warning: 4-7 days (concerning)
    - Safe: 8+ days (healthy buffer)
    
    Args:
        survival_days: Number of days user can survive with current fund
        
    Returns:
        str: Risk level ("Critical", "Warning", or "Safe")
        
    Examples:
        >>> calculate_risk_level(2.5)
        'Critical'
        >>> calculate_risk_level(5.0)
        'Warning'
        >>> calculate_risk_level(15.0)
        'Safe'
    """
    if survival_days <= 3:
        return "Critical"
    elif survival_days <= 7:
        return "Warning"
    else:
        return "Safe"


def get_risk_message(survival_days: float, risk_level: str) -> str:
    """
    Generate a contextual risk message based on survival days and risk level.
    
    Args:
        survival_days: Number of days user can survive
        risk_level: Risk classification ("Critical", "Warning", or "Safe")
        
    Returns:
        str: Human-readable risk message with emoji and actionable guidance
        
    Examples:
        >>> get_risk_message(2.0, "Critical")
        '🚨 CRITICAL: Fund depleted in 2.0 days. Stop all non-essential spending.'
        >>> get_risk_message(5.5, "Warning")
        '⚠️ WARNING: 5.5 days remaining. Reduce spending and add to fund.'
        >>> get_risk_message(20.0, "Safe")
        '✅ SAFE: 20.0 days of runway. Keep it up!'
    """
    messages = {
        "Critical": f"🚨 CRITICAL: Fund depleted in {survival_days:.1f} days. Stop all non-essential spending.",
        "Warning": f"⚠️ WARNING: {survival_days:.1f} days remaining. Reduce spending and add to fund.",
        "Safe": f"✅ SAFE: {survival_days:.1f} days of runway. Keep it up!",
    }
    
    return messages.get(risk_level, f"Status: {survival_days:.1f} days remaining")


def get_risk_action_items(
    risk_level: str,
    avg_daily_spending: float,
    emergency_fund: float
) -> List[str]:
    """
    Generate specific, actionable recommendations based on risk level.
    
    Provides 3 concrete action items tailored to the user's financial situation.
    Calculations are based on current spending patterns and fund balance.
    
    Args:
        risk_level: Risk classification ("Critical", "Warning", or "Safe")
        avg_daily_spending: Average daily spending amount
        emergency_fund: Current emergency fund balance
        
    Returns:
        List[str]: List of 3 actionable recommendations
        
    Examples:
        >>> get_risk_action_items("Critical", 500, 1000)
        ['Freeze all entertainment and non-essential spending immediately',
         'Add ₹1,000 to reach Warning level (4 days runway)',
         'Review and cancel unused subscriptions today']
    """
    if risk_level == "Critical":
        # Calculate amount needed to reach Warning level (4 days)
        amount_to_warning = max(0, (4 * avg_daily_spending) - emergency_fund)
        
        return [
            "Freeze all entertainment and non-essential spending immediately",
            f"Add ₹{amount_to_warning:,.0f} to reach Warning level (4 days runway)",
            "Review and cancel unused subscriptions today"
        ]
    
    elif risk_level == "Warning":
        # Calculate amount needed to reach Safe level (8 days)
        amount_to_safe = max(0, (8 * avg_daily_spending) - emergency_fund)
        
        # Calculate potential savings from 20% spending reduction
        potential_savings = avg_daily_spending * 0.2 * 7  # Weekly savings
        
        return [
            f"Reduce daily spending by 20% (save ₹{potential_savings:,.0f}/week)",
            f"Add ₹{amount_to_safe:,.0f} to reach Safe level (8+ days)",
            "Set up automatic daily/weekly deposits to emergency fund"
        ]
    
    else:  # Safe
        # Calculate 3-month emergency fund goal (90 days)
        three_month_goal = avg_daily_spending * 90
        amount_to_goal = max(0, three_month_goal - emergency_fund)
        
        # Calculate progress percentage
        progress = (emergency_fund / three_month_goal * 100) if three_month_goal > 0 else 100
        
        return [
            f"You're {progress:.0f}% toward a 3-month emergency fund (₹{three_month_goal:,.0f})",
            f"Add ₹{amount_to_goal:,.0f} more to reach the 90-day goal",
            "Consider locking your fund for 7-30 days to build discipline"
        ]


def get_risk_color(risk_level: str) -> str:
    """
    Get the color code associated with a risk level.
    
    Args:
        risk_level: Risk classification
        
    Returns:
        str: Hex color code for UI display
        
    Examples:
        >>> get_risk_color("Critical")
        '#EF4444'
        >>> get_risk_color("Warning")
        '#F59E0B'
        >>> get_risk_color("Safe")
        '#10B981'
    """
    colors = {
        "Critical": "#EF4444",  # Red
        "Warning": "#F59E0B",   # Amber
        "Safe": "#10B981",      # Emerald/Green
    }
    
    return colors.get(risk_level, "#6B7280")  # Default gray


def calculate_days_to_target(
    current_fund: float,
    target_days: int,
    avg_daily_spending: float
) -> float:
    """
    Calculate how much money is needed to reach a target number of survival days.
    
    Args:
        current_fund: Current emergency fund balance
        target_days: Target number of survival days
        avg_daily_spending: Average daily spending
        
    Returns:
        float: Amount needed to add to reach target (0 if already at target)
        
    Examples:
        >>> calculate_days_to_target(1000, 10, 200)
        1000.0  # Need ₹1000 more to reach 10 days (10*200 = 2000 total needed)
    """
    target_amount = target_days * avg_daily_spending
    amount_needed = max(0, target_amount - current_fund)
    return amount_needed


def get_risk_emoji(risk_level: str) -> str:
    """
    Get the emoji associated with a risk level.
    
    Args:
        risk_level: Risk classification
        
    Returns:
        str: Emoji character
    """
    emojis = {
        "Critical": "🚨",
        "Warning": "⚠️",
        "Safe": "✅",
    }
    
    return emojis.get(risk_level, "ℹ️")
