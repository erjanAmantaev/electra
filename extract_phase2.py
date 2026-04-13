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

targets = {
    "Checkout": "1:1676",
    "Profile": "1:1888",
    "OrderSuccess": "1:2746"
}

sys.stdout = open('phase2_structure.txt', 'w', encoding='utf-8')

for name, figma_id in targets.items():
    print(f"\\n{'='*20}\\nEXTRACTING {name} (ID {figma_id})\\n{'='*20}\\n")
    node = find_node(data.get("document", {}), figma_id)
    if node:
        def extract_content(n, indent=0):
            n_name = n.get("name", "Unnamed")
            typ = n.get("type", "Unknown")
            if typ == "TEXT":
                 print("  " * indent + f"[TEXT] {n.get('characters', '').strip()}")
            elif typ in ["FRAME", "GROUP", "COMPONENT", "INSTANCE", "SECTION"]:
                 print("  " * indent + f"[{typ}] {n_name}")
                 for child in n.get("children", []):
                     extract_content(child, indent + 1)
        extract_content(node)
    else:
        print("Not found.")
