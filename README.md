# dotnet-to-ts

> **Generate TypeScript interfaces from your C# models, DTOs, and view models for a smoother .NET + TypeScript workflow.**

---

## 🚀 What is this?

A CLI tool to automate generating TypeScript types from C# source files.  
Designed to eliminate manual syncing, speed up full-stack development, and support real C#/TS projects—personal or professional.

---

## 🏁 Quick Start

1. **Clone and build:**

   ```bash
   git clone https://github.com/danielmiranda22/dotnet-to-ts.git
   cd dotnet-to-ts
   npm install
   npm run build
   ```

2. **Try out the demo app:**

   ```bash
   cd examples/demo-app
   node ../../dist/cli.js init         # Creates a config file if needed
   node ../../dist/cli.js generate     # Generates all TypeScript interfaces
   ```

3. **Review output:**  
   Open `output/generated.ts` to find TypeScript interfaces for all discovered C# classes and all referenced types (as long as their `.cs` files are included in your input config).

---

## 🚦 CLI Usage

### 1️⃣ Initialize Config

```bash
dotnet-to-ts init
# or, if using local build:
node dist/cli.js init
```

Creates a starter `dotnet-to-ts.config.json`.

---

### 2️⃣ Generate TypeScript interfaces

```bash
dotnet-to-ts generate        # Global CLI
# or
node dist/cli.js generate    # Local usage
```

- Parses all matches from your `input` config.
- Outputs the result at the specified `output` path.

> **Tip:**  
> Add `--verbose` for detailed logs (matched files, config info, parsing details):

```bash
dotnet-to-ts generate --verbose
# or
node dist/cli.js generate --verbose
```

---

## 🧑‍💻 Example

Suppose you have these C# files in [`examples/demo-app`](examples/demo-app/):

```csharp
public class DepartmentDto
{
    public int Id { get; set; }
    public string? Description { get; set; }
}

public class ComplexViewModel
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int? IdDepartment { get; set; }
    public List<SimpleViewModel> Items { get; set; }
    public List<string> Roles { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

**Generate with:**

```bash
cd examples/demo-app
node ../../dist/cli.js generate
```

**Produces `output/generated.ts`:**

```typescript
export interface DepartmentDto {
  Id: number;
  Description: string | null;
}

export interface ComplexViewModel {
  Id: number;
  Name: string;
  IdDepartment: number | null;
  Items: SimpleViewModel[];
  Roles: string[];
  CreatedAt: string;
}
```

Referenced types (like `DepartmentDto` in other models/DTOs) are included so long as their `.cs` files appear in `"input"`.

---

## ⚙️ Configuration

The CLI reads `dotnet-to-ts.config.json` in your project root.

**Example:**

```json
{
  "input": ["Models/**/*.cs", "ViewModels/**/*.cs"],
  "output": "output/generated.ts",
  "options": {
    "indentation": "  ",
    "addTimestamp": true,
    "exportInterfaces": true
  }
}
```

- **input:** One or more glob patterns or file paths for `.cs` files, supporting both relative paths and globs.
- **output:** Path for the generated TypeScript file.
- **options:** Formatting and generation settings.

---

## 📁 Demo Project

For a working example, try the built-in demo app!

### Structure

```
examples/
  class-library/
    SimpleClass.cs
  demo-app/
    Models/
      DepartmentDto.cs
      SimpleDto.cs
    ViewModels/
      ComplexViewModel.cs
      SimpleViewModel.cs
    dotnet-to-ts.config.json
```

### Sample config

Reference **multiple locations**—inside or outside your project:

```json
{
  "input": [
    "Models/**/*.cs",
    "ViewModels/**/*.cs",
    "../class-library/SimpleClass.cs"
  ],
  "output": "output/generated.ts",
  "options": {
    "indentation": "  ",
    "addTimestamp": true,
    "exportInterfaces": true
  }
}
```

**Key points:**

- All `"input"` patterns are resolved _relative to your config file_.
- Use globs for entire folders, or direct paths to individual files.
- Supports referencing shared DTOs, enums (not yet supported), or base classes from anywhere in your solution.

**Generate and review:**

```bash
node ../../dist/cli.js generate
# or, after a global install:
dotnet-to-ts generate
```

Check `output/generated.ts` for all your TypeScript interfaces—including from cross-library or shared C# sources!

> **Tip:**  
> Add new DTOs or enums?  
> Just update the `"input"` list and re-run—dependencies will be included.

---

## ❗ Limitations

- ✅ **Supported:** Public C# classes, nested properties, lists, nullables, references by type.
- ❌ **Not supported:** Inheritance, enums (C# enums are not yet output as TypeScript enums), dictionaries/maps, non-public/internal/private members, C# attributes, or methods.
- ✨ Well-tested for internal use, focused on my own cases and needs.

---

## 🐛 Troubleshooting

- **No files found:**  
  Check `input` globs/file paths, and run the CLI from the correct directory.
- **Malformed config:**  
  Double-check your config for valid JSON, without trailing commas.
- **Output not as expected:**  
  Review your C# models/DTOs (see limitations) and examine generated TypeScript for clues.
- **Avoid committing generated files:**  
  Add this to your `.gitignore`:

  ```
  output/
  examples/demo-app/output/
  ```

---

## 👤 About

I built this CLI to make my .NET + TypeScript integration easier and less error-prone.  
Feel free to use, fork, or adapt for your projects.

---

## 📝 License

MIT  
Use at your own risk.
