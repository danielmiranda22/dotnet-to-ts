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
    // step 1: handle nullable types (e.g., int? -> int)
    const isNullable = csharpType.endsWith('?');
    if (isNullable) {
      const baseType = csharpType.slice(0, -1).trim(); // remove '?'
      const mappedBaseType = this.map(baseType); // recursive mapp the base type
      return `${mappedBaseType} | null`;
    }

    // Step 2: Handle List<T> and IList<T> (e.g., "List<string>" → "string[]")
    const listMatch = csharpType.match(/^(?:I)?List<(.+)>$/);
    if (listMatch && listMatch[1]) {
      console.log('Matched list type:', listMatch[1]);
      const elementType = this.map(listMatch[1]);
      const mappedInnerType = this.map(elementType);
      return `${mappedInnerType}[]`;
    }

    //step 3: Handele array types (e.g., "string[]" → "string[]")
    const arrayMatch = csharpType.match(/^(.+)\[\]$/);
    if (arrayMatch && arrayMatch[1]) {
      const mappedElementType = this.map(arrayMatch[1]);
      return `${mappedElementType}[]`;
    }

    // Step 4: Handle Dictionary<TKey, TValue> (e. g., "Dictionary<string, int>" → "Record<string, number>")
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

    // Step 5: Check if it's a basic type in our mapping table
    if (this.typeMap[csharpType]) {
      return this.typeMap[csharpType] as string;
    }

    // Step 6: If no match, assume it's a custom type (e.g., "EntityDto", "UserDto")
    // Keep it as-is because it refers to another interface
    return csharpType;
  }
}
