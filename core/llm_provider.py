import os
import google.generativeai as genai
try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

class LLMProvider:
    def __init__(self, offline_mode=False):
        self.offline_mode = offline_mode
        self.groq_api_key = os.environ.get("GROQ_API_KEY")
        self.gemini_api_key = os.environ.get("GEMINI_API_KEY")
        self.provider = None
        
        if self.offline_mode:
            return

        if self.groq_api_key and GROQ_AVAILABLE:
            print("Initializing Groq API...")
            self.client = Groq(api_key=self.groq_api_key)
            self.provider = "groq"
        elif self.gemini_api_key:
            print("Initializing Gemini API...")
            genai.configure(api_key=self.gemini_api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
            self.provider = "gemini"
        else:
            print("Warning: No API Keys found. Running in offline mode.")
            self.offline_mode = True

    def generate_response(self, prompt, system_instruction=None):
        """
        Sends a prompt to the LLM and returns the response.
        If in offline mode, returns a fallback response.
        """
        if self.offline_mode:
            return "I am currently in offline mode and cannot answer that request right now."
            
        try:
            if self.provider == "groq":
                messages = []
                if system_instruction:
                    messages.append({"role": "system", "content": system_instruction})
                messages.append({"role": "user", "content": prompt})
                
                chat_completion = self.client.chat.completions.create(
                    messages=messages,
                    model="llama-3.1-70b-versatile",
                    temperature=0.5,
                    max_tokens=1024,
                )
                return chat_completion.choices[0].message.content
                
            elif self.provider == "gemini":
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
