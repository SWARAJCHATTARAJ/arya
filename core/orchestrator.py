import os
import yaml
import importlib
import re
from typing import Dict, Any, TypedDict

try:
    from langgraph.graph import StateGraph, END
    LANGGRAPH_AVAILABLE = True
except ImportError:
    LANGGRAPH_AVAILABLE = False

class AgentState(TypedDict):
    query: str
    intent: str
    skill_name: str
    response_text: str
    action: str
    payload: str

class Orchestrator:
    def __init__(self, skills_dir="skills", llm_provider=None):
        self.skills_dir = skills_dir
        self.skills = []
        self.llm_provider = llm_provider
        self.load_skills()
        self.graph = self._build_graph() if LANGGRAPH_AVAILABLE else None

    def load_skills(self):
        print(f"Loading skills from {self.skills_dir}...")
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
                            
                        # Correct import logic
                        base_pkg = os.path.basename(os.path.normpath(self.skills_dir))
                        if not base_pkg:
                            base_pkg = "skills"
                        module_name = f"{base_pkg}.{item}.handler"
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

    def _build_graph(self):
        workflow = StateGraph(AgentState)
        
        # Nodes
        workflow.add_node("plan", self.node_plan)
        workflow.add_node("execute_skill", self.node_execute_skill)
        workflow.add_node("execute_llm", self.node_execute_llm)
        
        # Edges
        workflow.set_entry_point("plan")
        workflow.add_conditional_edges(
            "plan",
            lambda x: x["intent"],
            {
                "skill": "execute_skill",
                "llm": "execute_llm"
            }
        )
        workflow.add_edge("execute_skill", END)
        workflow.add_edge("execute_llm", END)
        
        return workflow.compile()

    def node_plan(self, state: AgentState) -> AgentState:
        text_lower = state["query"].lower()
        for skill in self.skills:
            for pattern in skill["patterns"]:
                if re.search(pattern.lower(), text_lower):
                    state["intent"] = "skill"
                    state["skill_name"] = skill["name"]
                    return state
        
        state["intent"] = "llm"
        return state

    def node_execute_skill(self, state: AgentState) -> AgentState:
        skill = next((s for s in self.skills if s["name"] == state["skill_name"]), None)
        if skill:
            try:
                res = skill["handler"](state["query"])
                if isinstance(res, str):
                    state["response_text"] = res
                else:
                    state["response_text"] = res.get("text", "")
                    state["action"] = res.get("action", "")
                    state["payload"] = res.get("payload", "")
            except Exception as e:
                state["response_text"] = f"Skill error: {e}"
        return state

    def node_execute_llm(self, state: AgentState) -> AgentState:
        if self.llm_provider:
            state["response_text"] = self.llm_provider.generate_response(state["query"])
        else:
            state["response_text"] = "I don't know how to handle that yet, and my brain is disconnected."
        return state

    def route_query(self, text):
        """
        Routes the transcribed text through LangGraph (if available), or falls back to legacy loop.
        """
        print(f"Routing query: '{text}'")
        
        if self.graph:
            initial_state = {
                "query": text,
                "intent": "",
                "skill_name": "",
                "response_text": "",
                "action": "",
                "payload": ""
            }
            result = self.graph.invoke(initial_state)
            
            res_dict = {"text": result.get("response_text", "")}
            if result.get("action"):
                res_dict["action"] = result["action"]
            if result.get("payload"):
                res_dict["payload"] = result["payload"]
            return res_dict
            
        else:
            # Fallback legacy routing if LangGraph isn't installed
            print("LangGraph not available, using simple routing fallback...")
            text_lower = text.lower()
            for skill in self.skills:
                for pattern in skill["patterns"]:
                    if re.search(pattern.lower(), text_lower):
                        print(f"Matched skill: {skill['name']}")
                        try:
                            response = skill["handler"](text)
                            if isinstance(response, str):
                                return {"text": response}
                            return response
                        except Exception as e:
                            print(f"Skill error: {e}")
                            return {"text": "Sorry, that skill encountered an error."}
            print("No skill matched. Falling back to LLM...")
            if self.llm_provider:
                response = self.llm_provider.generate_response(text)
                return {"text": response}
            else:
                return {"text": "I don't know how to handle that yet, and my brain is disconnected."}
