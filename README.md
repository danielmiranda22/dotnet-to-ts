# dotnet-to-ts

> **Automatically generate TypeScript interfaces from C# classes—no more manual type syncing.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Why I Built This

I work with .NET MVC and wanted to learn TypeScript properly. So, I decided to build something practical: a tool that generates TypeScript interfaces from C# classes.

The idea is simple - if I ever need to integrate TypeScript with a .NET backend (whether at my current company or elsewhere), I'll have a tool ready that keeps types in sync automatically. No manual copying, no drift between frontend and backend.

What started as a learning project turned into a properly tested CLI tool (100+ tests) that handles real scenarios like nullables, collections, and cross-file references.

If you're working with .NET + TypeScript, this might help you too.

---

## 📦 Installation

```bash
# Coming soon to npm:
npm install -g dotnet-to-ts

# For now, install from source:
git clone https://github.com/danielmiranda22/dotnet-to-ts.git
cd dotnet-to-ts
npm install
npm run build
npm install -g .
```

---

## 🚀 Quick Start

### 1. Initialize configuration

```bash
dotnet-to-ts init
```

This creates `dotnet-to-ts.config.json`:

```json
{
  "input": ["Models/**/*.cs", "ViewModels/**/*.cs"],
  "output": "generated/types.ts",
  "options": {
    "indentation": "  ",
    "addTimestamp": true,
    "exportInterfaces": true
  }
}
```

### 2. Generate TypeScript interfaces

```bash
dotnet-to-ts generate
```

That's it! Your TypeScript interfaces are ready.

---

## 💡 Example

**C# Input:**

```csharp
// Models/User.cs
public class UserDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string? Email { get; set; }
    public List<string> Roles { get; set; }
    public DateTime CreatedAt { get; set; }
    public int? IdDepartment { get; set; }
}

// Models/Department.cs
public class DepartmentDto
{
    public int Id { get; set; }
    public string Code { get; set; }
    public string? Description { get; set; }
    public int? ParentDepartmentId { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<int>? Managers { get; set; }
}
```

**Generated TypeScript:**

```typescript
// generated/types.ts
export interface UserDto {
  Id: number;
  Name: string;
  Email: string | null;
  Roles: string[];
  CreatedAt: string;
  IdDepartment: number | null;
}

export interface DepartmentDto {
  Id: number;
  Code: string;
  Description: string | null;
  ParentDepartmentId: number | null;
  CreatedAt: string;
  Managers: number[] | null;
}
```

**Key features:**

- ✅ Nullable types → `string | null`
- ✅ Generic collections → `UserDto[]`
- ✅ DateTime → `string` (JSON serialization)
- ✅ Referenced types automatically included

---

## ⚙️ Configuration

### Input Patterns

Supports glob patterns and direct file paths:

```json
{
  "input": [
    "Models/**/*.cs", // All .cs files in Models/
    "ViewModels/**/*.cs", // All .cs files in ViewModels/
    "../Shared/Dtos/Common.cs" // Specific file (relative path)
  ]
}
```

All paths are resolved **relative to your config file**.

### Options

```json
{
  "options": {
    "indentation": "  ", // Use spaces or tabs
    "addTimestamp": true, // Add generation timestamp
    "exportInterfaces": true // Export all interfaces
  }
}
```

---

## 🎯 Type Mappings

**Basic types:**

- Numbers: `int`, `long`, `decimal`, `float`, `double` → `number`
- Text: `string` → `string`
- Boolean: `bool` → `boolean`
- Dates: `DateTime`, `DateTimeOffset` → `string`
- IDs: `Guid` → `string`

**Collections:**

- `List<T>`, `T[]`, `IEnumerable<T>` → `T[]`
- `Dictionary<K, V>` → `Record<K, V>`

**Nullables:**

- `string?` → `string | null`
- `int?` → `number | null`

**Custom types:**

- Your C# classes → TypeScript interfaces (automatically included if referenced)

---

## 🛠️ CLI Commands

### `init`

Initialize configuration file:

```bash
dotnet-to-ts init
```

Creates `dotnet-to-ts.config.json` in current directory.

### `generate`

Generate TypeScript interfaces:

```bash
dotnet-to-ts generate
```

**Options:**

- `--verbose` - Show detailed generation logs

**Examples:**

```bash
# Standard generation
dotnet-to-ts generate

# Verbose output
dotnet-to-ts generate --verbose

```

---

## 📁 Project Structure Example

```
my-dotnet-project/
├── Backend/
│   ├── Models/
│   │   ├── UserDto.cs
│   │   └── DepartmentDto.cs
│   └── ViewModels/
│       └── DashboardViewModel.cs
├── Frontend/
│   ├── src/
│   │   └── types/
│   │       └── generated.ts          ← Output here
│   └── dotnet-to-ts.config.json      ← Config here
└── Shared/
    └── Common/
        └── BaseDto.cs
```

**Config in `Frontend/dotnet-to-ts.config.json`:**

```json
{
  "input": [
    "../Backend/Models/**/*.cs",
    "../Backend/ViewModels/**/*.cs",
    "../Shared/Common/BaseDto.cs"
  ],
  "output": "src/types/generated.ts"
}
```

---

## ✅ Features

- ✅ **Complex type support:** nullables, nested objects, arrays
- ✅ **Cross-project references:** Reference DTOs from anywhere in your solution
- ✅ **Comprehensive testing:** 100+ unit tests covering edge cases
- ✅ **Simple configuration:** JSON config with glob pattern support
- ✅ **Fast & lightweight:** No dependencies on .NET runtime

---

## ❗ Current Limitations

- ❌ **Custom generic types:** Only `List<T>` and `Dictionary<K,V>` are supported. Custom generic classes like `Result<T>` or `Response<T>` are not yet converted
- ❌ **Inheritance:** Base classes are not currently supported
- ❌ **Enums:** C# enums are not yet converted to TypeScript enums
- ❌ **Attributes:** C# attributes are ignored
- ❌ **Methods:** Only properties are processed

These features are planned for future releases.

---

## 🐛 Troubleshooting

### No files found

**Problem:** CLI reports "No files found"

**Solution:**

- Check your `input` glob patterns
- Ensure you're running from the correct directory (relative to config)
- Use `--verbose` flag to see which files are being matched

### Types not generated

**Problem:** Some C# classes don't appear in output

**Solution:**

- Ensure classes are `public`
- Check that `.cs` files are included in `input` patterns
- Verify C# syntax is valid (parser skips malformed classes)

### Unexpected output

**Problem:** Generated TypeScript doesn't match expectations

**Solution:**

- Review [Current Limitations](#-current-limitations)
- Use `--verbose` to see parsing details
- Check C# class structure matches supported patterns

---

## 📚 Examples

The repository includes a working demo app:

```bash
cd examples/demo-app
dotnet-to-ts generate
```

Check `examples/demo-app/output/generated.ts` to see the result.

---

## 🧪 Testing

The project uses Vitest with comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Current coverage:** 100+ tests covering:

- Type mapping (primitives, nullables, generics)
- Complex nested objects
- Cross-file references
- Edge cases (empty classes, invalid syntax)

---

## 🚀 Development

```bash
# Clone repository
git clone https://github.com/danielmiranda22/dotnet-to-ts.git
cd dotnet-to-ts

# Install dependencies
npm install

# Build project
npm run build

# Run tests
npm test

# Install locally for testing
npm install -g .
```

## 📝 License

MIT © Daniel Miranda
Feel free to read or use for your own learning or projects.

---

## 🙏 Acknowledgments

Built to solve a real problem: keeping .NET backend types and TypeScript frontend types in sync.

If this tool helps you, consider giving it a ⭐ on GitHub!

---

**Happy coding! 🚀**
