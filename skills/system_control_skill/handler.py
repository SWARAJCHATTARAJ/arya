import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from security.allowlist import get_action, execute_action
from security.audit_log import log_action

def handle(text):
    text_lower = text.lower()
    
    action_to_take = None
    if "open notepad" in text_lower:
        action_to_take = "open_notepad"
    elif "open calculator" in text_lower:
        action_to_take = "open_calculator"
    elif "delete temp files" in text_lower:
        action_to_take = "delete_temp_files"
        
    if not action_to_take:
        return "I heard a system command, but I don't have an action for it."
        
    action_info = get_action(action_to_take)
    
    if action_info.get("requires_confirmation"):
        # In a real assistant flow, you'd yield a state indicating confirmation is needed,
        # then the next user input would be checked for "yes" or "no".
        # For this PoC, we will simulate the confirmation flow or just deny it.
        return f"The action '{action_info['description']}' requires confirmation. Please confirm you want to do this."
        
    # Execute
    success, msg = execute_action(action_to_take)
    
    # Audit log
    log_action("SYSTEM_CONTROL", msg)
    
    if success:
        return f"I have executed the command: {action_info['description']}."
    else:
        return f"There was a problem executing the command. {msg}"
