import os
import google.generativeai as genai

class LLMProvider:
    def __init__(self, offline_mode=False):
        self.offline_mode = offline_mode
        self.api_key = os.environ.get("GEMINI_API_KEY")
        
        if not self.offline_mode and self.api_key:
            print("Initializing Gemini API...")
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        else:
            if not self.offline_mode:
                print("Warning: GEMINI_API_KEY not found. Running in offline mode.")
            self.offline_mode = True

    def generate_response(self, prompt, system_instruction=None):
        """
        Sends a prompt to Gemini and returns the response.
        If in offline mode, returns a fallback response.
        """
        if self.offline_mode:
            return "I am currently in offline mode and cannot answer that request right now."
            
        try:
            # We can optionally use system_instruction if needed by formatting the prompt,
            # but the GenerativeModel init for system_instruction is available in newer versions.
            if system_instruction:
                full_prompt = f"System: {system_instruction}\n\nUser: {prompt}"
            else:
                full_prompt = prompt
                
            response = self.model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            print(f"LLM Error: {e}")
            return "I'm having trouble connecting to my brain right now."

if __name__ == "__main__":
    llm = LLMProvider()
    print("Testing LLM:")
    print(llm.generate_response("What is the capital of France?"))
