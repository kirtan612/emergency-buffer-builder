"""
Sophisticated rule-based financial chatbot engine for Emergency Buffer Builder.

This module implements a behavioral finance-aware chatbot that provides
personalized financial advice without ML/AI APIs - pure logic and psychology.
"""

import re
from typing import Dict, List, Tuple, Optional, Any
from decimal import Decimal


class FinancialAdvisor:
    """
    Rule-based financial advisor chatbot with behavioral finance insights.
    
    Uses intent detection, context-aware responses, and psychological principles
    to provide empathetic, actionable financial guidance.
    """
    
    def __init__(self, user_context: Dict[str, Any]):
        """
        Initialize the financial advisor with user context.
        
        Args:
            user_context: Dictionary containing:
                - survival_days: float
                - risk_level: str (Critical/Warning/Safe)
                - avg_daily_spending: float
                - emergency_fund: float
                - monthly_allowance: float
                - top_categories: List[Dict] (optional)
                - total_30d_spending: float (optional)
        """
        self.survival_days = float(user_context.get('survival_days', 0))
        self.risk_level = user_context.get('risk_level', 'Unknown')
        self.avg_daily = float(user_context.get('avg_daily_spending', 0))
        self.fund = float(user_context.get('emergency_fund', 0))
        self.allowance = float(user_context.get('monthly_allowance', 0))
        self.top_categories = user_context.get('top_categories', [])
        self.total_30d = float(user_context.get('total_30d_spending', 0))
        
        # Calculate daily budget
        self.daily_budget = self.allowance / 30 if self.allowance > 0 else 0

    
    def respond(self, message: str) -> Dict[str, Any]:
        """
        Main entry point for chatbot responses.
        
        Routes message to appropriate intent handler based on pattern matching.
        
        Args:
            message: User's message text
            
        Returns:
            Dict with keys: reply, suggestions, context
        """
        message_lower = message.lower().strip()
        
        # Intent detection (most specific first)
        if self._matches_pattern(message_lower, ["can i spend", "can i buy", "can i afford", "afford"]):
            amount = self.extract_amount(message)
            if amount:
                return self.can_afford_check(message, amount)
        
        if self._matches_pattern(message_lower, ["broke", "no money", "poor", "empty", "running out"]):
            return self.broke_analysis(message)
        
        if self._matches_pattern(message_lower, ["improve", "save", "savings", "tips", "advice", "help me"]):
            return self.savings_advice(message)
        
        if self._matches_pattern(message_lower, ["how long", "survive", "runway", "last", "how many days"]):
            return self.survival_query(message)
        
        if self._matches_pattern(message_lower, ["fund", "emergency", "buffer", "vault", "safety net"]):
            return self.fund_status(message)
        
        if self._matches_pattern(message_lower, ["spending", "expense", "spent", "where", "money going", "breakdown"]):
            return self.spending_query(message)
        
        # Default handler for unmatched patterns
        return self.default_handler(message)

    
    def can_afford_check(self, message: str, amount: float) -> Dict[str, Any]:
        """
        Check if user can afford a specific amount.
        
        Provides impact analysis and behavioral nudges.
        """
        # Calculate spending multiplier
        multiplier = amount / self.avg_daily if self.avg_daily > 0 else 0
        
        # Calculate new survival days after this expense
        new_avg_daily = ((self.avg_daily * 30) + amount) / 30
        new_survival = self.fund / new_avg_daily if new_avg_daily > 0 else 999
        days_lost = self.survival_days - new_survival
        
        # Determine if affordable
        can_afford = amount <= self.daily_budget
        
        # Build response based on impact
        reply = ""
        
        if multiplier > 2:
            # High impact spending
            reply = f"⚠️ Hold on! ₹{self.format_currency(amount)} is {multiplier:.1f}x your daily average.\n\n"
            reply += f"📉 Impact: You'll lose {abs(days_lost):.1f} survival days "
            reply += f"({self.survival_days:.1f} → {new_survival:.1f} days)\n\n"
            
            if new_survival < 4:
                reply += "🚨 This would push you into CRITICAL territory!\n\n"
                reply += "💡 Suggestion: Can you reduce this expense by 50%? "
                reply += f"Even ₹{self.format_currency(amount/2)} would be safer."
            else:
                reply += "🤔 Ask yourself:\n"
                reply += "• Is this a need or a want?\n"
                reply += "• Can I wait 24 hours to decide?\n"
                reply += "• Is there a cheaper alternative?"
        
        elif multiplier > 1.5:
            # Moderate impact
            reply = f"💭 ₹{self.format_currency(amount)} is above your daily average.\n\n"
            reply += f"📊 Impact: -{abs(days_lost):.1f} survival days\n"
            reply += f"New runway: {new_survival:.1f} days ({self._get_risk_emoji(new_survival)})\n\n"
            
            if can_afford:
                reply += "✅ You can afford it, but consider:\n"
                reply += f"• That's {(amount/self.allowance*100):.1f}% of your monthly allowance\n"
                reply += "• Could you find a 20% cheaper option?"
            else:
                reply += "⚠️ This exceeds your daily budget.\n"
                reply += f"Daily budget: ₹{self.format_currency(self.daily_budget)}\n"
                reply += "Maybe split this across 2-3 days?"
        
        else:
            # Low impact - affordable
            reply = f"✅ Yes, ₹{self.format_currency(amount)} looks reasonable!\n\n"
            reply += f"📊 Impact: -{abs(days_lost):.1f} survival days "
            reply += f"({self.survival_days:.1f} → {new_survival:.1f})\n"
            reply += f"New status: {self._get_risk_level_from_days(new_survival)}\n\n"
            
            if self.risk_level == "Safe":
                reply += "💪 You're in good shape! Enjoy responsibly."
            else:
                reply += "👍 Manageable, but keep tracking your spending."
        
        # Generate contextual suggestions
        suggestions = self._get_suggestions_for_risk(new_survival)
        
        context = {
            "amount": amount,
            "can_afford": can_afford,
            "multiplier": multiplier,
            "days_lost": days_lost,
            "new_survival_days": new_survival,
            "new_risk_level": self._get_risk_level_from_days(new_survival)
        }
        
        return {
            "reply": reply,
            "suggestions": suggestions,
            "context": context
        }

    
    def broke_analysis(self, message: str) -> Dict[str, Any]:
        """
        Analyze why user feels broke and provide actionable insights.
        
        Uses behavioral finance principles to identify spending leaks.
        """
        reply = "Let me analyze your finances 🔍\n\n"
        
        # Find top spending drain
        if self.top_categories and len(self.top_categories) > 0:
            top_cat = self.top_categories[0]
            category = top_cat.get('category', 'unknown')
            total = float(top_cat.get('total', 0))
            pct = float(top_cat.get('percentage', 0))
            
            reply += f"💸 Your biggest drain: **{category.title()}**\n"
            reply += f"• Spent: ₹{self.format_currency(total)} ({pct:.0f}% of total)\n"
            reply += f"• That's ₹{self.format_currency(total/30):.0f}/day on {category}\n\n"
            
            # Calculate savings potential
            savings_30pct = total * 0.3
            savings_50pct = total * 0.5
            
            reply += f"💡 Savings potential:\n"
            reply += f"• Cut {category} by 30% → Save ₹{self.format_currency(savings_30pct)}/month\n"
            reply += f"• Cut {category} by 50% → Save ₹{self.format_currency(savings_50pct)}/month\n\n"
            
            # Category-specific advice
            advice = self._get_category_advice(category, total)
            reply += f"🎯 {advice}\n\n"
        
        # Overall financial health
        if self.avg_daily > 0:
            monthly_spending = self.avg_daily * 30
            overspend = monthly_spending - self.allowance
            
            if overspend > 0:
                reply += f"⚠️ You're overspending by ₹{self.format_currency(overspend)}/month\n"
                reply += f"That's ₹{self.format_currency(overspend/30):.0f}/day over budget!\n\n"
            else:
                reply += f"✅ Good news: You're within budget!\n"
                reply += f"Spending: ₹{self.format_currency(monthly_spending)}/month\n"
                reply += f"Allowance: ₹{self.format_currency(self.allowance)}/month\n\n"
        
        # Risk status
        reply += f"🛡️ Current status: {self.risk_level}\n"
        reply += f"Survival runway: {self.survival_days:.1f} days\n"
        reply += f"Emergency fund: ₹{self.format_currency(self.fund)}"
        
        suggestions = [
            "How can I improve my savings?",
            f"Can I spend ₹{int(self.daily_budget/2)} today?",
            "Show me my spending breakdown"
        ]
        
        context = {
            "top_category": self.top_categories[0] if self.top_categories else None,
            "overspending": self.avg_daily * 30 > self.allowance
        }
        
        return {
            "reply": reply,
            "suggestions": suggestions,
            "context": context
        }

    
    def savings_advice(self, message: str) -> Dict[str, Any]:
        """
        Provide personalized savings advice based on risk level.
        
        Uses behavioral economics principles and specific rupee amounts.
        """
        reply = "💡 Personalized Savings Strategy\n\n"
        
        tips = []
        
        if self.risk_level == "Critical":
            # Aggressive emergency measures
            reply += "🚨 CRITICAL MODE - Emergency Actions:\n\n"
            
            # Calculate amounts needed
            amount_to_warning = max(0, (4 * self.avg_daily) - self.fund)
            amount_to_safe = max(0, (8 * self.avg_daily) - self.fund)
            
            tips = [
                f"🔴 FREEZE all non-essential spending immediately\n"
                f"   Target: Add ₹{self.format_currency(amount_to_warning)} to reach Warning level",
                
                f"📱 Cancel unused subscriptions TODAY\n"
                f"   Average student wastes ₹500-800/month on unused subs",
                
                f"🍜 Switch to home-cooked meals for 2 weeks\n"
                f"   Potential savings: ₹{self.format_currency(self.avg_daily * 0.4 * 14)}"
            ]
            
            reply += "\n".join(f"{i+1}. {tip}" for i, tip in enumerate(tips))
            reply += f"\n\n🎯 Goal: Reach ₹{self.format_currency(amount_to_safe)} fund for Safe status"
        
        elif self.risk_level == "Warning":
            # Moderate reduction strategies
            reply += "⚠️ WARNING MODE - Smart Reductions:\n\n"
            
            amount_to_safe = max(0, (8 * self.avg_daily) - self.fund)
            weekly_target = amount_to_safe / 4
            
            tips = [
                f"📉 Reduce daily spending by 20%\n"
                f"   Current: ₹{self.format_currency(self.avg_daily)}/day → Target: ₹{self.format_currency(self.avg_daily * 0.8)}/day\n"
                f"   Monthly savings: ₹{self.format_currency(self.avg_daily * 0.2 * 30)}",
                
                f"💰 Set up automatic weekly deposits\n"
                f"   Deposit ₹{self.format_currency(weekly_target)}/week to reach Safe level in 1 month",
                
                f"🎯 Use the 50/30/20 rule\n"
                f"   50% needs (₹{self.format_currency(self.allowance * 0.5)})\n"
                f"   30% wants (₹{self.format_currency(self.allowance * 0.3)})\n"
                f"   20% savings (₹{self.format_currency(self.allowance * 0.2)})"
            ]
            
            reply += "\n".join(f"{i+1}. {tip}" for i, tip in enumerate(tips))
        
        else:  # Safe
            # Growth and optimization
            reply += "✅ SAFE MODE - Growth Strategies:\n\n"
            
            three_month_goal = self.avg_daily * 90
            amount_to_goal = max(0, three_month_goal - self.fund)
            progress_pct = (self.fund / three_month_goal * 100) if three_month_goal > 0 else 100
            
            tips = [
                f"🎯 Build toward 3-month emergency fund\n"
                f"   Current: {progress_pct:.0f}% (₹{self.format_currency(self.fund)})\n"
                f"   Goal: ₹{self.format_currency(three_month_goal)}\n"
                f"   Remaining: ₹{self.format_currency(amount_to_goal)}",
                
                f"🔒 Lock your fund for 7-30 days\n"
                f"   Builds discipline and prevents impulsive withdrawals\n"
                f"   You're stable enough to commit!",
                
                f"📊 Optimize your spending mix\n"
                f"   Review your top 3 categories monthly\n"
                f"   Challenge: Reduce each by 10% = ₹{self.format_currency(self.total_30d * 0.1)} saved"
            ]
            
            reply += "\n".join(f"{i+1}. {tip}" for i, tip in enumerate(tips))
        
        suggestions = self._get_suggestions_for_risk(self.survival_days)
        
        context = {
            "risk_level": self.risk_level,
            "tips_count": len(tips)
        }
        
        return {
            "reply": reply,
            "suggestions": suggestions,
            "context": context
        }

    
    def survival_query(self, message: str) -> Dict[str, Any]:
        """
        Explain survival days calculation and current runway.
        """
        reply = f"🛡️ Your Financial Runway\n\n"
        
        reply += f"📊 Current Status:\n"
        reply += f"• Survival Days: {self.survival_days:.1f} days\n"
        reply += f"• Risk Level: {self.risk_level} {self._get_risk_emoji(self.survival_days)}\n"
        reply += f"• Emergency Fund: ₹{self.format_currency(self.fund)}\n"
        reply += f"• Avg Daily Spending: ₹{self.format_currency(self.avg_daily)}\n\n"
        
        # Explain calculation
        reply += f"🧮 How it's calculated:\n"
        reply += f"Survival Days = Emergency Fund ÷ Avg Daily Spending\n"
        reply += f"= ₹{self.format_currency(self.fund)} ÷ ₹{self.format_currency(self.avg_daily)}\n"
        reply += f"= {self.survival_days:.1f} days\n\n"
        
        # Context and meaning
        if self.survival_days < 4:
            reply += "🚨 CRITICAL: You're in the danger zone!\n"
            reply += "This means if all income stopped today, you'd run out of money in less than 4 days.\n\n"
            reply += "🎯 Immediate action needed!"
        elif self.survival_days < 8:
            reply += "⚠️ WARNING: You need a bigger buffer.\n"
            reply += "Aim for at least 8 days (ideally 30+) for peace of mind.\n\n"
            reply += "💪 You're close! Keep building."
        else:
            reply += "✅ SAFE: You have a healthy buffer!\n"
            if self.survival_days < 30:
                reply += "Keep growing toward 30 days (1 month) for even more security.\n\n"
            elif self.survival_days < 90:
                reply += "Excellent! Consider building toward 90 days (3 months) - the gold standard.\n\n"
            else:
                reply += "Outstanding! You've achieved the 3-month emergency fund goal! 🎉\n\n"
        
        # Show milestones
        milestones = [
            (4, "Warning Level", 4 * self.avg_daily),
            (8, "Safe Level", 8 * self.avg_daily),
            (30, "1-Month Buffer", 30 * self.avg_daily),
            (90, "3-Month Goal", 90 * self.avg_daily)
        ]
        
        reply += "🎯 Milestones:\n"
        for days, label, amount in milestones:
            if self.survival_days < days:
                needed = amount - self.fund
                status = f"Need ₹{self.format_currency(needed)} more"
            else:
                status = "✅ Achieved"
            reply += f"• {label} ({days} days): {status}\n"
        
        suggestions = [
            "How can I increase my survival days?",
            "What's my biggest spending category?",
            f"Can I afford ₹{int(self.avg_daily)} today?"
        ]
        
        context = {
            "survival_days": self.survival_days,
            "risk_level": self.risk_level,
            "next_milestone": self._get_next_milestone(self.survival_days)
        }
        
        return {
            "reply": reply,
            "suggestions": suggestions,
            "context": context
        }

    
    def fund_status(self, message: str) -> Dict[str, Any]:
        """
        Provide emergency fund status and recommendations.
        """
        reply = f"🛡️ Emergency Fund Status\n\n"
        
        reply += f"💰 Current Balance: ₹{self.format_currency(self.fund)}\n"
        reply += f"📊 Survival Runway: {self.survival_days:.1f} days\n"
        reply += f"🎯 Risk Level: {self.risk_level}\n\n"
        
        # Calculate progress toward goals
        three_month_goal = self.avg_daily * 90
        progress_pct = (self.fund / three_month_goal * 100) if three_month_goal > 0 else 100
        
        reply += f"📈 Progress toward 3-month goal:\n"
        reply += f"• Goal: ₹{self.format_currency(three_month_goal)}\n"
        reply += f"• Progress: {min(100, progress_pct):.1f}%\n"
        reply += f"• Remaining: ₹{self.format_currency(max(0, three_month_goal - self.fund))}\n\n"
        
        # Recommendations based on fund size
        if self.fund == 0:
            reply += "🚨 Your fund is empty!\n\n"
            reply += "Start small:\n"
            reply += f"• Week 1: Add ₹{self.format_currency(self.daily_budget * 2)}\n"
            reply += f"• Week 2: Add ₹{self.format_currency(self.daily_budget * 3)}\n"
            reply += f"• Week 3: Add ₹{self.format_currency(self.daily_budget * 4)}\n"
            reply += "Build the habit first, then increase amounts."
        
        elif self.fund < self.avg_daily * 4:
            reply += "⚠️ Priority: Reach 4-day minimum\n"
            needed = (self.avg_daily * 4) - self.fund
            reply += f"Add ₹{self.format_currency(needed)} to reach Warning level\n\n"
            reply += "💡 Quick wins:\n"
            reply += "• Skip 2 restaurant meals → ₹400-600\n"
            reply += "• Cancel 1 unused subscription → ₹200-500\n"
            reply += "• Reduce entertainment by 50% this week"
        
        elif self.fund < self.avg_daily * 8:
            reply += "💪 You're in Warning zone - keep pushing!\n"
            needed = (self.avg_daily * 8) - self.fund
            reply += f"Add ₹{self.format_currency(needed)} to reach Safe level\n\n"
            reply += "🎯 Strategy:\n"
            reply += f"• Save ₹{self.format_currency(needed/4)}/week for 4 weeks\n"
            reply += "• That's just reducing daily spending by 20%"
        
        else:
            reply += "✅ You're in Safe territory!\n\n"
            if self.fund < three_month_goal:
                reply += "🎯 Next goal: 3-month emergency fund\n"
                reply += f"Keep adding ₹{self.format_currency((three_month_goal - self.fund)/12)}/week\n"
                reply += "You'll reach it in ~3 months!"
            else:
                reply += "🎉 You've achieved the 3-month goal!\n\n"
                reply += "Consider:\n"
                reply += "• Locking part of your fund for 30 days\n"
                reply += "• Exploring low-risk investments\n"
                reply += "• Helping friends learn about emergency funds"
        
        suggestions = [
            "How can I grow my fund faster?",
            "What's my spending breakdown?",
            "How many days can I survive?"
        ]
        
        context = {
            "fund_amount": self.fund,
            "progress_percent": min(100, progress_pct),
            "three_month_goal": three_month_goal
        }
        
        return {
            "reply": reply,
            "suggestions": suggestions,
            "context": context
        }

    
    def spending_query(self, message: str) -> Dict[str, Any]:
        """
        Provide spending breakdown and insights.
        """
        reply = f"💸 Your Spending Breakdown\n\n"
        
        if self.total_30d > 0:
            reply += f"📊 Last 30 Days: ₹{self.format_currency(self.total_30d)}\n"
            reply += f"📈 Daily Average: ₹{self.format_currency(self.avg_daily)}\n"
            reply += f"💰 Monthly Allowance: ₹{self.format_currency(self.allowance)}\n\n"
            
            # Budget status
            if self.total_30d > self.allowance:
                overspend = self.total_30d - self.allowance
                reply += f"⚠️ You're ₹{self.format_currency(overspend)} over budget!\n\n"
            else:
                remaining = self.allowance - self.total_30d
                reply += f"✅ You're ₹{self.format_currency(remaining)} under budget!\n\n"
        
        # Top categories
        if self.top_categories and len(self.top_categories) > 0:
            reply += "🏆 Top Spending Categories:\n\n"
            
            for i, cat in enumerate(self.top_categories[:3], 1):
                category = cat.get('category', 'unknown')
                total = float(cat.get('total', 0))
                pct = float(cat.get('percentage', 0))
                count = cat.get('transaction_count', 0)
                
                emoji = self._get_category_emoji(category)
                reply += f"{i}. {emoji} {category.title()}\n"
                reply += f"   ₹{self.format_currency(total)} ({pct:.0f}%) • {count} transactions\n"
                reply += f"   Avg: ₹{self.format_currency(total/count)}/transaction\n\n"
            
            # Insights
            if len(self.top_categories) > 0:
                top = self.top_categories[0]
                top_pct = float(top.get('percentage', 0))
                
                if top_pct > 40:
                    reply += f"⚠️ {top['category'].title()} dominates your spending ({top_pct:.0f}%)\n"
                    reply += "Consider diversifying or reducing this category.\n"
                elif top_pct < 20:
                    reply += "✅ Your spending is well-balanced across categories!\n"
        else:
            reply += "📝 No spending data yet.\n"
            reply += "Start tracking your expenses to see insights here!"
        
        suggestions = [
            "How can I reduce my top spending?",
            f"Can I spend ₹{int(self.daily_budget)} today?",
            "Why am I broke?"
        ]
        
        context = {
            "total_spending": self.total_30d,
            "top_categories": self.top_categories[:3] if self.top_categories else []
        }
        
        return {
            "reply": reply,
            "suggestions": suggestions,
            "context": context
        }

    
    def default_handler(self, message: str) -> Dict[str, Any]:
        """
        Handle unmatched queries with fuzzy keyword matching and helpful suggestions.
        """
        message_lower = message.lower()
        
        # Fuzzy keyword matching
        keywords = {
            "budget": "Your daily budget is ₹{:.0f}. You're spending ₹{:.0f}/day on average.",
            "help": "I can help you with spending checks, savings advice, and financial insights!",
            "hello": "Hi there! 👋 I'm your Buffer Advisor. How can I help with your finances today?",
            "thanks": "You're welcome! Keep building that emergency fund! 💪",
            "risk": f"Your current risk level is {self.risk_level} with {self.survival_days:.1f} survival days.",
        }
        
        for keyword, response_template in keywords.items():
            if keyword in message_lower:
                if "{" in response_template:
                    reply = response_template.format(self.daily_budget, self.avg_daily)
                else:
                    reply = response_template
                
                reply += "\n\n"
                break
        else:
            # No keyword match - provide general intro
            reply = f"👋 Hi! I'm your Buffer Advisor.\n\n"
            reply += f"📊 Quick Stats:\n"
            reply += f"• Survival Days: {self.survival_days:.1f}\n"
            reply += f"• Risk Level: {self.risk_level} {self._get_risk_emoji(self.survival_days)}\n"
            reply += f"• Emergency Fund: ₹{self.format_currency(self.fund)}\n"
            reply += f"• Daily Spending: ₹{self.format_currency(self.avg_daily)}\n\n"
        
        reply += "💡 I can help you with:\n"
        reply += "• Checking if you can afford something\n"
        reply += "• Analyzing your spending patterns\n"
        reply += "• Improving your financial health\n"
        reply += "• Understanding your risk level\n"
        reply += "• Growing your emergency fund"
        
        suggestions = [
            "Can I spend ₹300 today?",
            "Why am I broke?",
            "How can I improve my savings?",
            "What's my risk level?",
            "How many days can I survive?"
        ]
        
        context = {
            "matched_keyword": None,
            "default_response": True
        }
        
        return {
            "reply": reply,
            "suggestions": suggestions,
            "context": context
        }

    
    # ============================================
    # HELPER METHODS
    # ============================================
    
    def extract_amount(self, text: str) -> Optional[float]:
        """
        Extract monetary amount from text using regex.
        
        Supports formats: 500, 1,000, 1000.50, ₹500
        
        Args:
            text: Input text
            
        Returns:
            float: Extracted amount or None
        """
        # Pattern matches: ₹500, 1,000, 1000.50, etc.
        pattern = r'₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)'
        match = re.search(pattern, text)
        
        if match:
            amount_str = match.group(1).replace(',', '')
            try:
                return float(amount_str)
            except ValueError:
                return None
        
        return None
    
    def format_currency(self, amount: float) -> str:
        """
        Format amount as Indian currency.
        
        Args:
            amount: Numeric amount
            
        Returns:
            str: Formatted string like "1,234.00"
        """
        return f"{amount:,.2f}"
    
    def _matches_pattern(self, text: str, patterns: List[str]) -> bool:
        """
        Check if text matches any of the given patterns.
        
        Args:
            text: Text to check
            patterns: List of pattern strings
            
        Returns:
            bool: True if any pattern matches
        """
        return any(pattern in text for pattern in patterns)
    
    def _get_risk_emoji(self, survival_days: float) -> str:
        """Get emoji for risk level based on survival days."""
        if survival_days <= 3:
            return "🚨"
        elif survival_days <= 7:
            return "⚠️"
        else:
            return "✅"
    
    def _get_risk_level_from_days(self, days: float) -> str:
        """Calculate risk level from survival days."""
        if days <= 3:
            return "Critical"
        elif days <= 7:
            return "Warning"
        else:
            return "Safe"

    
    def _get_suggestions_for_risk(self, survival_days: float) -> List[str]:
        """
        Generate contextual suggestions based on risk level.
        
        Args:
            survival_days: Current or projected survival days
            
        Returns:
            List of 3 suggestion strings
        """
        if survival_days <= 3:
            return [
                "What should I do in Critical mode?",
                "How can I quickly add to my fund?",
                "Show me my biggest spending drain"
            ]
        elif survival_days <= 7:
            return [
                "How do I reach Safe level?",
                "What's my spending breakdown?",
                f"Can I afford ₹{int(self.daily_budget/2)} today?"
            ]
        else:
            return [
                "How do I build a 3-month fund?",
                "Should I lock my emergency fund?",
                "What's my financial health score?"
            ]
    
    def _get_next_milestone(self, survival_days: float) -> Dict[str, Any]:
        """Get the next milestone to achieve."""
        milestones = [
            (4, "Warning Level"),
            (8, "Safe Level"),
            (30, "1-Month Buffer"),
            (90, "3-Month Goal")
        ]
        
        for days, label in milestones:
            if survival_days < days:
                return {
                    "days": days,
                    "label": label,
                    "amount_needed": (days * self.avg_daily) - self.fund
                }
        
        return {
            "days": 90,
            "label": "3-Month Goal (Achieved!)",
            "amount_needed": 0
        }
    
    def _get_category_emoji(self, category: str) -> str:
        """Get emoji for spending category."""
        emojis = {
            "food": "🍔",
            "transport": "🚗",
            "education": "📚",
            "entertainment": "🎮",
            "healthcare": "🏥",
            "shopping": "🛍️",
            "housing": "🏠",
            "utilities": "💡",
            "subscriptions": "📱",
            "other": "📦"
        }
        return emojis.get(category.lower(), "💰")

    
    def _get_category_advice(self, category: str, amount: float) -> str:
        """
        Get category-specific behavioral advice.
        
        Uses behavioral economics principles tailored to each category.
        """
        advice_map = {
            "food": (
                f"Try the 'Cook 3x/week' challenge. "
                f"Home meals cost ~₹50 vs ₹150+ outside. "
                f"Potential monthly savings: ₹{self.format_currency(amount * 0.4)}"
            ),
            "transport": (
                f"Consider carpooling or public transport 2 days/week. "
                f"Could save ₹{self.format_currency(amount * 0.3)}/month. "
                f"Bonus: Better for environment!"
            ),
            "entertainment": (
                f"Use the '24-hour rule' for entertainment spending. "
                f"Wait a day before buying. 30% of impulse buys get cancelled. "
                f"Potential savings: ₹{self.format_currency(amount * 0.3)}"
            ),
            "shopping": (
                f"Try the 'One in, one out' rule. "
                f"Before buying something new, remove something old. "
                f"Reduces impulse purchases by ~40%."
            ),
            "subscriptions": (
                f"Audit your subscriptions monthly. "
                f"Average person wastes ₹600/month on unused services. "
                f"Cancel what you haven't used in 30 days."
            ),
            "education": (
                f"Look for free alternatives first (YouTube, Khan Academy, library). "
                f"Many paid courses have free equivalents. "
                f"Could save ₹{self.format_currency(amount * 0.2)}"
            ),
            "healthcare": (
                f"Preventive care saves money long-term. "
                f"Generic medicines cost 50-80% less than brands. "
                f"Always ask your doctor about generic options."
            ),
            "utilities": (
                f"Small habits = big savings. "
                f"Turn off lights, unplug chargers, use fans over AC. "
                f"Can reduce bills by 15-20%."
            ),
            "housing": (
                f"If renting, negotiate rent annually. "
                f"Consider roommates to split costs. "
                f"Even ₹500/month savings = ₹6,000/year."
            ),
            "other": (
                f"Categorize 'other' expenses to find patterns. "
                f"Hidden spending leaks often hide here. "
                f"Track for 2 weeks to identify."
            )
        }
        
        return advice_map.get(category.lower(), 
            f"Review this category weekly. Small cuts add up to big savings over time.")


# ============================================
# CONVENIENCE FUNCTION
# ============================================

def create_advisor(user_context: Dict[str, Any]) -> FinancialAdvisor:
    """
    Factory function to create a FinancialAdvisor instance.
    
    Args:
        user_context: User financial context dictionary
        
    Returns:
        FinancialAdvisor: Configured advisor instance
    """
    return FinancialAdvisor(user_context)
