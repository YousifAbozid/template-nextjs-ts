# Next.js v15, TypeScript, Tailwind CSS v4, Prettier, ESLint and Husky Template

A modern, ready-to-use template for building web applications with Next.js v15, TypeScript, and Tailwind CSS v4, featuring a comprehensive theming system with dark mode support.

## Features

- 🎨 Complete theming system with semantic color variables
- 🌓 Dark mode support out of the box
- 📱 Responsive design ready
- 🚀 Optimized for Tailwind CSS v4
- ⚛️ Next.js v15 with TypeScript and App Router
- ⚡️ Fast development and builds with Next.js
- 🧹 ESLint and Prettier for code quality
- 🪝 Husky and lint-staged for pre-commit hooks

## Technologies Used

This template combines the following technologies to provide a modern development experience:

- **Next.js v15**: The React framework for production with App Router and latest features
- **TypeScript**: Static type checking for more robust code
- **Tailwind CSS v4**: Utility-first CSS framework with built-in dark mode support
- **ESLint**: Linting utility for identifying and fixing code problems
- **Prettier**: Code formatter for consistent styling
- **Husky**: Git hooks to enforce code quality checks before commits
- **lint-staged**: Run linters on git staged files

## Getting Started

### Installation

1. Clone this repository:

   ```bash
   git clone [repository-url] my-project
   cd my-project
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. Open your browser and visit http://localhost:3000

### Project Structure

```
template-nextjs-ts/
├── .husky/                # Git hooks configuration
├── app/                   # Next.js App Router
│   ├── components/        # Reusable components
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page component
├── public/                # Static assets
├── styles/                # Global styles and theme variables
├── next.config.js         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
├── eslint.config.js       # ESLint configuration (new format)
└── package.json           # Project dependencies and scripts
```

## Available Scripts

The template includes the following npm scripts:

- **`npm run dev`**: Start the development server
- **`npm run build`**: Build the app for production
- **`npm start`**: Run the production build
- **`npm run lint`**: Run ESLint to check for code issues
- **`npm run lint:fix`**: Run ESLint and automatically fix issues
- **`npm run format`**: Run Prettier to format all files
- **`npm run format:check`**: Check if files are properly formatted
- **`npm run fix-all`**: Run both lint:fix and format to fix all issues
- **`npm run upgrade`**: Update all dependencies to their latest versions

## Theme System

This template includes a carefully crafted theming system with semantic color variables for both light and dark modes.

### Color System Structure

Colors are organized in the following categories:

- **Light/Dark Background Colors**: Primary, secondary, tertiary, and hover states
- **Light/Dark Text Colors**: Primary, secondary, tertiary, and inverted text
- **Accent Colors**: Primary, secondary, success, warning, danger
- **Border Colors**: Light and dark mode borders
- **Shadow Colors**: For consistent box-shadow effects

### How to Use Theme Colors

You can apply theme colors directly using Tailwind utility classes:

```jsx
// Background colors
<div className="bg-l-bg-1 dark:bg-d-bg-1">...</div>

// Text colors
<p className="text-l-text-2 dark:text-d-text-2">...</p>

// Border colors
<div className="border border-border-l dark:border-border-d">...</div>

// Accent colors
<button className="bg-accent-1">Primary Action</button>
<div className="text-accent-success">Success message</div>
```

### More Theme Examples

```jsx
// Button with theme colors
<button className="bg-accent-1 hover:bg-accent-2 text-l-text-inv dark:text-d-text-inv px-4 py-2 rounded">
  Submit
</button>

// Card with theme colors
<div className="bg-l-bg-2 dark:bg-d-bg-2 border border-border-l dark:border-border-d rounded-lg p-4 shadow-md">
  <h3 className="text-l-text-1 dark:text-d-text-1 font-bold">Card Title</h3>
  <p className="text-l-text-2 dark:text-d-text-2">Card content goes here...</p>
  <span className="text-accent-success">Success message</span>
</div>

// Alert component using theme colors
<div className="bg-l-bg-3 dark:bg-d-bg-3 border-l-4 border-accent-warning p-4">
  <p className="text-l-text-1 dark:text-d-text-1">Warning alert message</p>
</div>

// Error state using theme colors
<div className="text-accent-danger border border-accent-danger rounded p-2">
  Error message
</div>
```

### Customizing the Theme

To customize the theme, modify the color variables in `styles/globals.css`:

```css
@theme {
  /* Light Mode - Background Colors */
  --color-l-bg-1: #ffffff; /* Your custom color */
  --color-l-bg-2: #f6f8fa; /* Your custom color */

  /* Light Mode - Text Colors */
  --color-l-text-1: #24292f; /* Your custom color */

  /* Dark Mode Colors */
  --color-d-bg-1: #0d1117; /* Your custom color */

  /* Accent Colors */
  --color-accent-1: #58a6ff; /* Your custom color */
  --color-accent-success: #3fb950; /* Your custom color */

  /* Add more custom colors as needed */
}
```

After modifying the theme variables, the Tailwind classes will automatically use your custom colors.

## Dark Mode Implementation

This template includes a ready-to-use dark mode implementation:

1. **Theme Toggle Component**: Located at `app/components/ThemeToggle.tsx`, this component provides a button to switch between light and dark modes.

2. **Local Storage**: User preference is saved to local storage so it persists between visits.

3. **System Preference Detection**: The template automatically detects the user's system preference for dark/light mode on first visit.

4. **Implementation Example**:

```jsx
import ThemeToggle from '@/components/ThemeToggle';

function MyComponent() {
  return (
    <div className="bg-l-bg-1 dark:bg-d-bg-1 text-l-text-1 dark:text-d-text-1">
      <h1>My Component</h1>
      <ThemeToggle />
    </div>
  );
}
```

## Development Tools

### ESLint Configuration

This template uses ESLint to enforce code quality. The configuration is in `eslint.config.js` (using the new flat config format) and includes:

- Next.js recommended rules
- TypeScript integration
- Import order rules
- React Hooks rules

To run ESLint:

```bash
npm run lint      # Check for issues
npm run lint:fix  # Fix issues automatically
```

### Prettier Configuration

Prettier ensures consistent code formatting. Configuration is in `.prettierrc`:

```json
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2,
  "printWidth": 80,
  "trailingComma": "es5",
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

To run Prettier:

```bash
npm run format        # Format all files
npm run format:check  # Check formatting
```

### Husky and lint-staged

The template uses Husky to run checks before commits and lint-staged to only check files that are being committed:

- ESLint and Prettier run on staged JavaScript/TypeScript files
- Prettier runs on staged JSON and Markdown files

This ensures that all committed code meets the project's quality standards.

## Next.js v15 Specific Features

This template comes with the latest Next.js v15 features pre-configured:

- **App Router**: Improved routing and layouts with file-based routing
- **Server Components**: Enhanced performance with React Server Components
- **Server Actions**: Simplified form handling and mutations
- **Improved TypeScript Support**: Better type checking and DX
- **Optimized Images**: Automatic image optimization with next/image
- **API Routes**: Create API endpoints within your Next.js app
- **Middleware**: Add custom logic to handle requests before they complete
- **Incremental Static Regeneration**: Update static pages without rebuilding the entire site
- **Fast Refresh**: Quick feedback loop during development

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details on deployment options.
