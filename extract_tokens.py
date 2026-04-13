import json
import sys

def rgba_to_hex(r, g, b, a=1):
    return f"#{int(r*255):02x}{int(g*255):02x}{int(b*255):02x}"

def main():
    try:
        with open("figma.json", "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        print("figma.json not found.")
        return

    colors = set()
    fonts = set()
    screens = []

    def traverse(node):
        if "fills" in node:
            for fill in node["fills"]:
                if fill.get("type") == "SOLID" and "color" in fill:
                    c = fill["color"]
                    colors.add(rgba_to_hex(c.get("r",0), c.get("g",0), c.get("b",0)))
                    
        if "style" in node and node.get("type") == "TEXT":
            style = node["style"]
            ff = style.get("fontFamily")
            fs = style.get("fontSize")
            fw = style.get("fontWeight")
            fonts.add(f"{ff} (Weight: {fw}, Size: {fs}px)")
            
        for child in node.get("children", []):
            traverse(child)

    pages = data.get("document", {}).get("children", [])
    for page in pages:
        if page.get("type") == "CANVAS":
            for child in page.get("children", []):
                if child.get("type") == "FRAME":
                    screens.append({"name": child.get("name"), "id": child.get("id")})
                traverse(child)

    print("=== MAIN SCREENS/FRAMES ===")
    for s in screens:
        print(f"- {s['name']} (ID: {s['id']})")
        
    print("\n=== EXTRACTED COLORS ===")
    for c in list(colors):
        print("-", c)
        
    print("\n=== EXTRACTED TYPOGRAPHY ===")
    for f in list(fonts)[:30]:
        print("-", f)

if __name__ == "__main__":
    main()
