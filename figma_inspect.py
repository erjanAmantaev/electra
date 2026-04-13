import urllib.request
import json
import os
import sys

token = os.getenv("FIGMA_TOKEN")
file_id = os.getenv("FIGMA_FILE_ID", "766JPqWqX3N1VuSot67aXu")

if not token:
    print("Error: FIGMA_TOKEN environment variable is required.")
    sys.exit(1)

url = f"https://api.figma.com/v1/files/{file_id}"

req = urllib.request.Request(url, headers={"X-Figma-Token": token})
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())

    with open("figma.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    doc = data.get("document", {})

    def print_tree(node, depth=0):
        print("  " * depth + f"- {node.get('name', 'Unnamed')} ({node.get('type', 'Unknown')}) [ID: {node.get('id')}]")
        for child in node.get("children", []):
            if child.get("type") in ["DOCUMENT", "CANVAS", "FRAME", "GROUP", "SECTION", "COMPONENT", "INSTANCE"]:
                print_tree(child, depth + 1)

    print("Successfully fetched Figma file. File structure:")
    print_tree(doc)

except Exception as e:
    print(f"Error: {e}")
