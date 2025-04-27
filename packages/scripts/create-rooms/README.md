# Create Room Script

This script creates a new room by sending a signed request to the API.

## Prerequisites

- Node.js (v14 or higher)
- pnpm
- TypeScript
- A `.env` file in the parent directory containing your `PRIVATE_KEY`

## Installation

1. Install dependencies:

```bash
# Install ts-node and typescript globally (recommended)
pnpm add -g ts-node typescript

# Or install as dev dependencies in your project
pnpm add -D ts-node typescript @types/node
```

2. Create a `.env` file in the parent directory with your private key:

```
PRIVATE_KEY=your_private_key_here
```

## Usage

1. Create a JSON file (e.g., `room-details.json`) with the following structure:

```json
{
  "roomName": "Your Room Name",
  "roomPrompt": "Your Room Prompt"
}
```

2. Run the script:

```bash
# Using ts-node (if installed globally)
ts-node create-rooms.ts room-details.json https://your-api-url/room/create

# Using pnpm
pnpm ts-node create-rooms.ts room-details.json https://your-api-url/room/create

# Or after building
node dist/create-rooms.js room-details.json https://your-api-url/room/create
```

## Building

To build the TypeScript file:

```bash
# Build the TypeScript file
pnpm tsc create-rooms.ts

# The compiled JavaScript will be in the dist directory
```

## Error Handling

The script will:

- Validate the presence of required environment variables
- Check for required fields in the JSON file
- Handle API errors and display appropriate error messages
- Provide type safety for all operations

## Troubleshooting

Common errors and solutions:

1. `sh: ts-node: command not found`

   - Solution: Install ts-node globally: `pnpm add -g ts-node typescript`
   - Or use pnpm: `pnpm ts-node create-rooms.ts ...`

2. `Cannot find module 'typescript'`

   - Solution: Install typescript: `pnpm add -g typescript`
   - Or as a dev dependency: `pnpm add -D typescript`

3. `Error: PRIVATE_KEY environment variable is not set`

   - Solution: Create a `.env` file in the parent directory with your private key
   - Make sure the file is in the correct location (two directories up from the script)

4. `Error: JSON file must contain roomName and roomPrompt fields`

   - Solution: Check your JSON file structure matches the required format
   - Ensure both `roomName` and `roomPrompt` fields are present

5. `SyntaxError: Cannot use import statement outside a module`
   - Solution: The script uses CommonJS modules. Make sure you're using the latest version of the script
   - If you see this error, you might be using an old version that used ES modules

## Security

- Never commit your `.env` file or expose your private key
- The script uses environment variables for sensitive data
- All API requests are signed using your private key
