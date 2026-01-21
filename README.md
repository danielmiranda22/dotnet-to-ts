# dotnet-to-ts

> **Generate TypeScript interfaces from your C# models, DTOs, and view models for a smoother .NET + TypeScript workflow.**

---

## 🚀 What is this?

A CLI tool to automate generating TypeScript types from C# source files.  
Designed for my personal and work projects, to avoid manually syncing types and to accelerate full-stack development.

---

## 🏁 Quick Start

1. **Clone and build:**

   ```bash
   git clone https://github.com/YOUR_USERNAME/dotnet-to-ts.git
   cd dotnet-to-ts
   npm install
   npm run build
   ```

2. **Try out the demo app:**

   ```bash
   cd examples/demo-app
   node ../../dist/cli.js init           # Creates a config file if needed
   node ../../dist/cli.js generate       # Or just: node ../../dist/cli.js
   ```

3. **Review output:**  
   Open `output/generated.ts` – you’ll see TypeScript interfaces for all discovered C# classes.

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
dotnet-to-ts generate
dotnet-to-ts generate:ts
dotnet-to-ts
# Or if local:
node dist/cli.js generate
node dist/cli.js generate:ts
node dist/cli.js
```

- Parses all matches from your `input` config.
- Outputs the result at the specified `output` path.

---

## 🧑‍💻 Example

**Given these C# files (see [`examples/demo-app`](examples/demo-app/)):**

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

**CLI usage:**

```bash
cd examples/demo-app
node ../../dist/cli.js init        # Once only, if no config yet
node ../../dist/cli.js             # Or node ../../dist/cli.js generate
```

**Generates `output/generated.ts`:**

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

### 🐛 Debugging with `--verbose`

Add the `--verbose` flag to any command for extra log output!  
This will print the loaded config, matched files, and parsing details.

```bash
dotnet-to-ts generate --verbose
# or
node dist/cli.js generate --verbose
```

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

- **input:** One or more glob patterns for `.cs` files.
- **output:** Path for the generated TypeScript file.
- **options:** Formatting and generation options.

---

## 📁 Demo Project

For a working example, try the built-in demo app:

```
examples/demo-app/
├── Models/
├── ViewModels/
└── dotnet-to-ts.config.json
```

- Populate C# files in `Models` and `ViewModels`
- Generate types with the CLI
- Find output in `output/generated.ts`

---

## ❗ Limitations

- ✅ **Supported:** Public C# classes, nested properties, lists, nullables, references by type.
- ❌ **Not supported:** Inheritance, enums, dictionaries/maps, non-public/internal/private members, C# attributes, or methods.
- 🚧 **No `--verbose` CLI yet** (planned).
- ✨ Well-tested internally, but focused on my own use cases and needs.

---

## 🐛 Troubleshooting

- **No files found:**  
  Check `input` glob patterns (e.g. `"Models/**/*.cs"`) and run CLI from the correct directory.
- **Malformed config:**  
  Edit your JSON carefully and remove trailing commas.
- **Output not as expected:**  
  Double-check C# class design (see limitations), open your generated TypeScript to debug.
- **Want to avoid committing generated files?**  
  Add this to your `.gitignore`:

  ```
  output/
  examples/demo-app/output/
  ```

---

## 👤 About

I built this CLI for my own workflow and to make my .NET + TypeScript integration smoother.  
Feel free to use, fork, or adapt for your projects.  
Ideas or feedback? Open an issue or reach out!

---

## 📝 License

MIT  
Use at your own risk.
