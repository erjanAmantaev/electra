import json
import sys

with open("figma.json", "r", encoding="utf-8") as f:
    data = json.load(f)

def find_node(node, node_id):
    if node.get("id") == node_id:
        return node
    for child in node.get("children", []):
        found = find_node(child, node_id)
        if found: return found
    return None

home = find_node(data.get("document", {}), "1:1085")

import sys
sys.stdout = open('homepage_structure.txt', 'w', encoding='utf-8')

if home:
    def extract_content(node, indent=0):
        name = node.get("name", "Unnamed")
        typ = node.get("type", "Unknown")
        
        if typ == "TEXT":
             print("  " * indent + f"[TEXT] {node.get('characters', '').strip()}")
        elif typ in ["FRAME", "GROUP", "COMPONENT", "INSTANCE", "SECTION", "RECTANGLE", "VECTOR"]:
             # only print significant containers
             print("  " * indent + f"[{typ}] {name}")
             for child in node.get("children", []):
                 extract_content(child, indent + 1)
                 
    extract_content(home)
else:
    print("Homepage not found.")
