import os
import yaml
import importlib
import re

class Orchestrator:
    def __init__(self, skills_dir="skills", llm_provider=None):
        self.skills_dir = skills_dir
        self.skills = []
        self.llm_provider = llm_provider
        self.load_skills()

    def load_skills(self):
        print(f"Loading skills from {self.skills_dir}...")
        
        # Ensure directory exists
        if not os.path.exists(self.skills_dir):
            os.makedirs(self.skills_dir)
            return

        for item in os.listdir(self.skills_dir):
            skill_path = os.path.join(self.skills_dir, item)
            if os.path.isdir(skill_path):
                yaml_file = os.path.join(skill_path, "skill.yaml")
                if os.path.exists(yaml_file):
                    try:
                        with open(yaml_file, 'r') as f:
                            manifest = yaml.safe_load(f)
                            
                        # Import the handler
                        module_name = f"{self.skills_dir}.{item}.handler"
                        module = importlib.import_module(module_name)
                        
                        skill_data = {
                            "name": manifest.get("name"),
                            "patterns": manifest.get("patterns", []),
                            "handler": getattr(module, "handle", None),
                            "manifest": manifest
                        }
                        
                        if skill_data["handler"]:
                            self.skills.append(skill_data)
                            print(f"Loaded skill: {skill_data['name']}")
                    except Exception as e:
                        print(f"Failed to load skill {item}: {e}")

    def route_query(self, text):
        """
        Routes the transcribed text to a skill, or falls back to LLM.
        """
        print(f"Routing query: '{text}'")
        text_lower = text.lower()
        
        # 1. Check against local skills
        for skill in self.skills:
            for pattern in skill["patterns"]:
                # Simple regex match
                if re.search(pattern.lower(), text_lower):
                    print(f"Matched skill: {skill['name']}")
                    try:
                        return skill["handler"](text)
                    except Exception as e:
                        print(f"Skill error: {e}")
                        return "Sorry, that skill encountered an error."
                        
        # 2. Fallback to LLM
        print("No skill matched. Falling back to LLM...")
        if self.llm_provider:
            return self.llm_provider.generate_response(text)
        else:
            return "I don't know how to handle that yet, and my brain is disconnected."

if __name__ == "__main__":
    # Test orchestrator
    orc = Orchestrator()
    print("Orchestrator test ready.")
