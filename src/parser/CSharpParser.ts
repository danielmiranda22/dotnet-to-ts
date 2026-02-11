/**
 * CSharperParser.ts - A parser for C# code to extract class and property information.
 */

export interface Property {
  name: string | undefined;
  type: string | undefined;
}

export interface ParsedClass {
  name: string;
  properties: Property[];
}

export class CSharpParser {
  /**
   * Parses the given C# code and extracts class definitions along with their properties.
   * @param csharpCode
   * @returns An array of ParsedClass objects or null if parsing fails.
   */
  parse(csharpCode: string): ParsedClass | null {
    const className = this.extractClassName(csharpCode);
    if (!className) return null;
    const properties = this.extractProperties(csharpCode);
    return { name: className, properties: properties };
  }

  /**
   * Extracts properties from the given C# code.
   * Looks for: public Type PropertyName { get; set; }
   * @param csharpCode
   * @returns An array of Property objects.
   */
  private extractProperties(csharpCode: string): Property[] {
    const properties: Property[] = [];

    // Regex explanation:
    // public\s+              - literal "public" followed by whitespace
    // (\w+(?:<\w+>)?\??)     - capture group 1: type name
    //   \w+                  - base type (int, string, etc.)
    //   (?: <\w+>)?           - optional generic (<string>)
    //   \??                  - optional nullable (?)
    // \s+                    - whitespace
    // (\w+)                  - capture group 2: property name
    // \s*\{\s*get;\s*set;\s*\}  - property getter/setter syntax
    const propertyRegex =
      /public\s+(\w+(?:<[^>]+>)?\??)\s+(\w+)\s*\{\s*get;\s*set;\s*\}/g;

    let match;
    while ((match = propertyRegex.exec(csharpCode)) !== null) {
      properties.push({
        type: match[1], // Type ("int", "string", "List<string>")
        name: match[2], // Property name ("Id", "Name")
      });
    }
    return properties;
  }

  /**
   * Extracts the class name from the given C# code.
   * @param csharpCode
   * @returns The class name if found, otherwise null.
   */
  private extractClassName(csharpCode: string): string | null {
    // Regex explanation:
    // class\s+       - literal "class" followed by whitespace
    // (\w+)          - capture group:  one or more word characters (the class name)
    const classRegex = /class\s+(\w+)/;
    const match = csharpCode.match(classRegex);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  }
}
