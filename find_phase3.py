import json
import sys

with open("figma.json", "r", encoding="utf-8") as f:
    data = json.load(f)

def find_frames(node, depth=0):
    if depth > 10: return
    name = node.get("name", "").lower()
    if node.get("type") in ["FRAME", "CANVAS"] and ("about" in name or "support" in name or "contact" in name):
        print(f"MATCH: {node.get('name')} -> {node.get('id')}")
    for child in node.get("children", []):
         find_frames(child, depth + 1)

print("Searching for Phase 3 Frames...")
find_frames(data.get("document", {}))
