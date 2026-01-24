/**
 * TypeMapper is responsible for mapping C# types to TypeScript types.
 */
export class TypeMapper {
  // basic C# to TypeScript type mapping
  private readonly typeMap: Record<string, string> = {
    // C# primitives → TypeScript primitives
    int: 'number',
    long: 'number',
    short: 'number',
    byte: 'number',
    float: 'number',
    double: 'number',
    decimal: 'number',

    char: 'string',
    string: 'string',

    bool: 'boolean',
    boolean: 'boolean',

    // special types
    DateTime: 'string', // DateTime serializes to ISO string in JSON
    DateTimeOffset: 'string',
    Guid: 'string', // GUID serializes to string in JSON
    dynamic: 'any',
    object: 'any',
    var: 'any',

    void: 'void',
  };

  map(csharpType: string): string {
    // Handle nullable types (int? -> int)
    const isNullable = csharpType.endsWith('?');
    if (isNullable) {
      const baseType = csharpType.slice(0, -1).trim(); // remove '?'
      const mappedBaseType = this.map(baseType); // recursive mapp the base type
      return `${mappedBaseType} | null`;
    }

    // Handle List<T> and IList<T> ("List<string>" → "string[]")
    const listMatch = csharpType.match(/^(?:I)?List<(.+)>$/);
    if (listMatch && listMatch[1]) {
      console.log('Matched list type:', listMatch[1]);
      const elementType = this.map(listMatch[1]);
      const mappedInnerType = this.map(elementType);

      // If inner type is a union (contains "|"), wrap in parentheses
      if (mappedInnerType.includes('|')) {
        return `(${mappedInnerType})[]`;
      }

      return `${mappedInnerType}[]`;
    }

    // Handle array types ("string[]" → "string[]")
    const arrayMatch = csharpType.match(/^(.+)\[\]$/);
    if (arrayMatch && arrayMatch[1]) {
      const mappedElementType = this.map(arrayMatch[1]);
      return `${mappedElementType}[]`;
    }

    // Handle Dictionary<TKey, TValue> ("Dictionary<string, int>" → "Record<string, number>")
    const dictionaryMatch = csharpType.match(
      /^(?:I)?Dictionary<(.+),\s*(.+)>$/,
    );
    if (dictionaryMatch && dictionaryMatch[1] && dictionaryMatch[2]) {
      const keyType = this.map(dictionaryMatch[1]);
      const valueType = this.map(dictionaryMatch[2]);
      const mappedKeyType = this.map(keyType);
      const mappedValueType = this.map(valueType);
      return `Record<${mappedKeyType}, ${mappedValueType}>`;
    }

    // Check if it's a basic type in our mapping table
    if (this.typeMap[csharpType]) {
      return this.typeMap[csharpType] as string;
    }

    // Step 6: If no match, assume it's a custom type ("EntityDto", "UserDto")
    // Keep it as-is because it refers to another interface
    return csharpType;
  }
}
