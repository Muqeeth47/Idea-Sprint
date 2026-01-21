import re

class EligibilityVerifier:
    def __init__(self):
        pass

    def extract_age_limit(self, text):
        # Patterns like "18-60 years", "age group of 18 to 40", "above 60 years"
        # Returns tuple (min_age, max_age)
        
        # Pattern: "18-60 years" or "18 to 60 years"
        range_match = re.search(r'(\d{1,3})\s*(?:-|to)\s*(\d{1,3})\s*years?', text, re.IGNORECASE)
        if range_match:
            return int(range_match.group(1)), int(range_match.group(2))
            
        # Pattern: "above 60 years" or "more than 60 years"
        above_match = re.search(r'(?:above|more than)\s*(\d{1,3})\s*years?', text, re.IGNORECASE)
        if above_match:
            return int(above_match.group(1)), 100 # Assuming 100 as broad max
            
        # Pattern: "below 18 years" or "less than 18 years"
        below_match = re.search(r'(?:below|less than)\s*(\d{1,3})\s*years?', text, re.IGNORECASE)
        if below_match:
            return 0, int(below_match.group(1)) - 1
            
        return None, None

    def extract_income_limit(self, text):
        # Patterns like "income less than ₹1,00,000", "income does not exceed Rs 2 lakh"
        
        # Normalized text for easier matching
        clean_text = text.lower().replace(',', '').replace('₹', 'rs ')
        
        # Pattern: "income less than/not exceed [amount]"
        # Matches: "less than rs 100000", "not exceed 200000"
        match = re.search(r'(?:income|salary)\s*(?:should|must)?\s*(?:not exceed|less than|below|upto)\s*(?:rs\.?)?\s*(\d+)', clean_text)
        if match:
            return float(match.group(1))
            
        return None

    def check_eligibility(self, scheme_data, user_profile):
        """
        user_profile: {'age': int, 'income': int, 'caste': str, 'gender': str}
        scheme_data: The full row dictionary of the scheme
        """
        text = str(scheme_data.get('eligibility', '')) + " " + str(scheme_data.get('details', ''))
        
        status = "ELIGIBLE"
        reasons = []
        
        # 1. Age Check
        if user_profile.get('age'):
            min_age, max_age = self.extract_age_limit(text)
            user_age = int(user_profile['age'])
            if min_age is not None and max_age is not None:
                if not (min_age <= user_age <= max_age):
                    status = "NOT ELIGIBLE"
                    reasons.append(f"Age {user_age} is not within valid range {min_age}-{max_age}.")
        
        # 2. Income Check
        if user_profile.get('income'):
            income_limit = self.extract_income_limit(text)
            user_income = float(user_profile['income'])
            if income_limit is not None:
                if user_income > income_limit:
                    status = "NOT ELIGIBLE"
                    reasons.append(f"Income {user_income} exceeds limit of {income_limit}.")
        
        # 3. Simple Keyword Checks (Gender)
        if user_profile.get('gender'):
            user_gender = user_profile['gender'].lower()
            text_lower = text.lower()
            if user_gender == 'male':
                if 'women' in text_lower or 'female' in text_lower or 'girl' in text_lower:
                    # Check if it isn't "men and women"
                    if 'men and women' not in text_lower:
                        # status = "NOT ELIGIBLE" # Soft check for now, can uncomment to be strict
                        pass

        # 4. Caste Check
        if user_profile.get('caste'):
            user_caste = user_profile['caste'].upper() # SC, ST, OBC
            text_upper = text.upper()
            
            # If scheme is specifically for SC/ST
            is_sc_scheme = 'SCHEDULED CASTE' in text_upper or ' SC ' in text_upper
            is_st_scheme = 'SCHEDULED TRIBE' in text_upper or ' ST ' in text_upper
            
            if is_sc_scheme and user_caste != 'SC' and user_caste != 'ST': # Sometimes SC/ST are grouped
                 status = "NOT ELIGIBLE"
                 reasons.append(f"Scheme is for SC/ST, but your category is {user_caste}")
            
            if is_st_scheme and user_caste != 'ST':
                 status = "NOT ELIGIBLE"
                 reasons.append(f"Scheme is for ST, but your category is {user_caste}") 
        
        if not reasons:
            return "ELIGIBLE", ["Matches all extracted criteria (Age/Income). Please verify documents."]
        
        return "NOT ELIGIBLE", reasons
