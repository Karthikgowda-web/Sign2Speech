# MCP Server Installation Guide

## What is MCP?
MCP (Model Context Protocol) servers allow AI assistants like Cursor to connect to external tools, databases, APIs, and services.

## Installation Steps

### Option 1: Install a Pre-built MCP Server

#### Example: Filesystem MCP Server
```bash
npm install -g @modelcontextprotocol/server-filesystem
```

#### Example: GitHub MCP Server
```bash
npm install -g @modelcontextprotocol/server-github
```

#### Example: SQLite MCP Server
```bash
npm install -g @modelcontextprotocol/server-sqlite
```

### Option 2: Install MCP SDK to Build Your Own
```bash
npm install -g @modelcontextprotocol/server
```

## Configure MCP Server in Cursor

### Step 1: Find Cursor Settings
On Windows, Cursor settings are typically located at:
- `%APPDATA%\Cursor\User\settings.json`
- Or: `C:\Users\<YourUsername>\AppData\Roaming\Cursor\User\settings.json`

### Step 2: Add MCP Configuration

Open Cursor settings and add the MCP configuration. The format depends on your Cursor version:

#### For Cursor with MCP Support:
```json
{
  "mcp": {
    "servers": {
      "filesystem": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/directory"]
      },
      "github": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-github"],
        "env": {
          "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here"
        }
      }
    }
  }
}
```

#### Alternative: Using Cursor's MCP Config File
Create or edit: `%APPDATA%\Cursor\User\mcp.json`

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "C:\\Users\\kusum\\Downloads"]
    }
  }
}
```

## Popular MCP Servers to Install

### 1. Filesystem Server
```bash
npm install -g @modelcontextprotocol/server-filesystem
```
**Use**: Read/write files, browse directories

### 2. GitHub Server
```bash
npm install -g @modelcontextprotocol/server-github
```
**Use**: Access GitHub repositories, issues, PRs

### 3. SQLite Server
```bash
npm install -g @modelcontextprotocol/server-sqlite
```
**Use**: Query SQLite databases

### 4. PostgreSQL Server
```bash
npm install -g @modelcontextprotocol/server-postgres
```
**Use**: Query PostgreSQL databases

### 5. Brave Search Server
```bash
npm install -g @modelcontextprotocol/server-brave-search
```
**Use**: Web search capabilities

## Verify Installation

After installing, verify the server works:
```bash
npx -y @modelcontextprotocol/server-filesystem --help
```

## Troubleshooting

### Issue: "Command not found"
- Make sure Node.js is installed: `node --version`
- Make sure npm is in your PATH
- Try installing with `npx` instead of global install

### Issue: Cursor doesn't recognize MCP
- Check Cursor version (MCP support may require latest version)
- Restart Cursor after configuration
- Check Cursor's logs for MCP-related errors

### Issue: Permission errors
- On Windows, you may need to run PowerShell as Administrator
- Or use `npx` instead of global installs

## Example: Quick Setup for Filesystem Access

1. **Install the server:**
   ```bash
   npm install -g @modelcontextprotocol/server-filesystem
   ```

2. **Configure in Cursor:**
   - Open Cursor Settings (Ctrl+,)
   - Search for "MCP" or "Model Context Protocol"
   - Add configuration for filesystem server

3. **Test it:**
   - Ask Cursor to read a file using MCP
   - Or browse a directory

## Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [MCP Servers List](https://github.com/modelcontextprotocol/servers)
- [Cursor MCP Documentation](https://cursor.sh/docs/mcp)

---

**Note**: MCP support in Cursor may vary by version. Check Cursor's documentation for the latest MCP configuration format.

