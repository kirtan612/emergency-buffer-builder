"""
Chatbot API endpoints for Emergency Buffer Builder.

This module provides rule-based financial advice through a conversational interface
using the sophisticated FinancialAdvisor engine.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import logging

from database import get_db
from models import User
from schemas import ChatMessage, ChatResponse
from auth import get_current_user
from services.finance_logic import calculate_insights, calculate_spending_by_category
from services.chat_engine import create_advisor

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/message",
    response_model=ChatResponse,
    summary="Send Message to Chatbot",
    description="Send a message to the rule-based financial advisor chatbot and receive personalized advice",
    responses={
        200: {"description": "Chatbot response generated successfully"},
        401: {"description": "Not authenticated"}
    }
)
async def send_chat_message(
    message_data: ChatMessage,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Process a user message and generate contextual financial advice.
    
    The chatbot uses sophisticated rule-based logic with behavioral finance
    principles to provide personalized, actionable advice.
    
    Args:
        message_data: User's message to the chatbot
        db: Database session
        current_user: Authenticated user from JWT token
        
    Returns:
        ChatResponse: Bot reply, suggested follow-up questions, and context data
        
    Features:
        - Spending affordability checks with impact analysis
        - Risk level explanations with specific recommendations
        - Survival days calculations and milestone tracking
        - Category-specific spending advice
        - Behavioral finance nudges
        - Contextual follow-up suggestions
        
    Business Logic:
        1. Calculate current financial insights
        2. Get spending breakdown by category
        3. Build comprehensive user context
        4. Initialize FinancialAdvisor with context
        5. Process message and generate response
        6. Return reply with suggestions
        
    Chatbot Capabilities:
        - "Can I spend ₹500?" - Affordability checks
        - "Why am I broke?" - Spending analysis
        - "How can I save?" - Personalized advice
        - "What's my risk level?" - Risk assessment
        - "How long can I survive?" - Survival calculation
        
    Example:
        POST /chatbot/message
        {
            "message": "Can I spend ₹500 today?"
        }
        
        Response:
        {
            "reply": "✅ Yes, ₹500 looks reasonable!...",
            "suggestions": ["What's my risk level?", ...],
            "context": {"amount": 500, "can_afford": true, ...}
        }
    """
    # Calculate current financial insights
    insights = await calculate_insights(db, current_user.id)
    
    # Get spending breakdown by category
    top_categories = await calculate_spending_by_category(db, current_user.id, days=30)
    
    # Build comprehensive user context for advisor
    user_context = {
        "survival_days": float(insights['survival_days']),
        "risk_level": insights['risk_level'],
        "avg_daily_spending": float(insights['avg_daily_spending']),
        "emergency_fund": float(insights['emergency_fund']),
        "monthly_allowance": float(current_user.monthly_allowance),
        "top_categories": top_categories,
        "total_30d_spending": float(insights['total_30d_spending'])
    }
    
    # Create advisor and get response
    advisor = create_advisor(user_context)
    response = advisor.respond(message_data.message)
    
    logger.info(
        f"Chatbot interaction for {current_user.email}: "
        f"'{message_data.message[:50]}...'"
    )
    
    return ChatResponse(
        reply=response["reply"],
        suggestions=response["suggestions"],
        context=response["context"]
    )



@router.get(
    "/suggestions",
    response_model=List[str],
    summary="Get Initial Chatbot Suggestions",
    description="Get suggested questions based on user's current risk level",
    responses={
        200: {"description": "Suggestions retrieved successfully"},
        401: {"description": "Not authenticated"}
    }
)
async def get_chat_suggestions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get initial suggested questions based on user's financial situation.
    
    Returns contextual question suggestions tailored to the user's
    current risk level and financial health.
    
    Args:
        db: Database session
        current_user: Authenticated user from JWT token
        
    Returns:
        List of 5 suggested questions
        
    Suggestion Strategy:
        - Critical: Focus on emergency steps and immediate actions
        - Warning: Focus on reduction strategies and improvement
        - Safe: Focus on growth, optimization, and long-term goals
        
    Business Logic:
        1. Calculate current insights to get risk level
        2. Generate suggestions based on risk level
        3. Return contextual questions
        
    Example:
        GET /chatbot/suggestions
        
        Response (Critical):
        [
            "What should I do in Critical mode?",
            "How can I quickly add to my fund?",
            "Show me my biggest spending drain",
            "Can I afford ₹100 today?",
            "What's my survival runway?"
        ]
        
        Response (Warning):
        [
            "How do I reach Safe level?",
            "What's my spending breakdown?",
            "Can I afford ₹300 today?",
            "How can I reduce my spending?",
            "Show my emergency fund status"
        ]
        
        Response (Safe):
        [
            "How do I build a 3-month fund?",
            "Should I lock my emergency fund?",
            "What's my spending trend?",
            "Can I afford ₹500 today?",
            "How can I optimize my budget?"
        ]
    """
    # Calculate insights to get risk level
    insights = await calculate_insights(db, current_user.id)
    risk_level = insights['risk_level']
    survival_days = float(insights['survival_days'])
    avg_daily = float(insights['avg_daily_spending'])
    
    # Generate suggestions based on risk level
    if risk_level == "Critical":
        suggestions = [
            "What should I do in Critical mode?",
            "How can I quickly add to my fund?",
            "Show me my biggest spending drain",
            f"Can I afford ₹{int(avg_daily/2)} today?",
            "What's my survival runway?"
        ]
    elif risk_level == "Warning":
        suggestions = [
            "How do I reach Safe level?",
            "What's my spending breakdown?",
            f"Can I afford ₹{int(avg_daily)} today?",
            "How can I reduce my spending?",
            "Show my emergency fund status"
        ]
    else:  # Safe
        suggestions = [
            "How do I build a 3-month fund?",
            "Should I lock my emergency fund?",
            "What's my spending trend?",
            f"Can I afford ₹{int(avg_daily * 1.5)} today?",
            "How can I optimize my budget?"
        ]
    
    logger.info(
        f"Generated {len(suggestions)} suggestions for {current_user.email} "
        f"(risk: {risk_level}, {survival_days:.1f} days)"
    )
    
    return suggestions
