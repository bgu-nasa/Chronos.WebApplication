# Chronos Portal

This is the monorepo for Chronos Portal, tech-lead: aaroni@post.bgu.ac.il / aron.iz.gab@gmail.com.

## Table of contents

1. Docker
2. Release
3. Libraries we use
4. Contribution Rules
    - Css and Styling
    - File Exports & Imports
    - File Naming
    - Display Strings
    - Changing the `module.config.ts` file
    - Making requests to external APIs
    - Code Styling
5. Working with modules
    - Creating a new module
    - Mapping a page to a route
    - Adding navigation items
6. Common & Infra

## Docker

To run the app in a Docker container on port 3000:

```bash
npm run docker:start
```

This builds the image and runs the container, injecting environment variables from `.local.env`. You can also run the steps separately:

```bash
npm run docker:build   # Build the Docker image
npm run docker:run     # Run the container with .local.env
```

Make sure `.local.env` exists in the project root. See `.env.example` for the required variables.

## Release

The project uses a GitHub Actions workflow to publish a Docker image to GitHub Container Registry (ghcr.io).

The published image is available at: `ghcr.io/bgu-nasa/chronos-web:latest`

To trigger a release:

1. Go to the **Actions** tab in GitHub
2. Select the **Chronos.Portal.Publish** workflow
3. Click **Run workflow**

Each release is tagged with both `latest` and the commit SHA for traceability.

You should visit [Chronos.ServiceProxy](https://github.com/bgu-nasa/Chronos.ServiceProxy) for more info.

## Libraries we use

1. [Mantine Core](https://mantine.dev/) - As component library
2. [React Icons](https://react-icons.github.io/react-icons/) - For icons
3. [React Router](https://reactrouter.com/) - For routing (only for infra, regular contributors should not need to deal with it)

**TODO:** State management library, some ajax library etc.

## Contribution Rules

### Css and Styling

We use `*.module.css` files for styling components. Please avoid using inline CSS unless absolutely necessary.

For Mantine components, avoid using the inline styling props (e.g. w, p, h, m etc.) and prefer using `className` with CSS modules for consistency, read the mantine docs.

### File Exports & Imports

Use barrel files (index.ts) for exporting modules from a directory. This helps keep imports clean and organized.

Do not use relative paths unless for the same directory, always prefer absolute imports from the `src` directory, which is aliased with `@`. E.g. `import { Button } from '@/some-module/button'`.

### File Naming

Use kebab-case for file and directory names. E.g. `home-page.tsx`, `user-profile/`.

### Display Strings

Use english for all display strings in the codebase. And all display strings should be defined in resources files `*.resources.json`.

### Changing the `module.config.ts` file

When changing the `module.config.ts` file you must add Aaron as a reviewer to your PR.

### Making requests to external APIs

A host object will be defined with configuration management in the infra module. Still under development.

### Code Styling

Use prettier for code formatting. Run `npm run format` to format your code before committing.

Use camelCase for variable and function names, PascalCase for component and class names.

Please logically group related code, distinguish between data fetching, state management, utility, and UI rendering.

Keep code under `@/your_module/src`, please avoid adding code directly under `@/your_module/`.

`.static` is for static assets like images, fonts, and icons, but it's best to avoid using it and instead use the `public` folder for such assets.

`.mock` is for mock data used in testing and development.

There's global scripts directory for your scripts so everyonce can use them.

Document your code with jsdoc comments for functions, classes, and complex logic. And add `README.md` files in complex directories to explain their purpose and usage, it's highly encouraged in your module.

## Working with modules

### Creating a new module

Contact Aaron the tech-lead for your module request with the following details:

```
- Module name
- Module description
- Module owner (yourself or someone else) alias@post.bgu.ac.il
- Base path for the module (e.g. /home)
- Module song
```

### Mapping a page to a route

Notice the `module.config.ts` file in each module. To map a page component to a route, add an entry to the `routes` array in the module config file. For example:

```typescript
import React from "react";
import { SomePage } from "./some-page";
...
{
    path: "/page", // route, will be prefixed with the module basePath
    name: "Some Page", // route name, just for reference & human readability
    element: React.createElement(SomePage), // your object component
}
```

### Adding navigation items

Before talking about navigation item it's important to understand the `location` property of a navigation item. In the portal we have 3 "different" areas. Dashboard -> The internal dashboard for users after they log in. Public for all public pages that do not require authentication. And "admin" which is unused at the momemnt.

Note that in the future we intend to add conditional rendering of navigation items based on user roles and permissions.

To add navigation items for your module, update the `navigationItems` array in the module config file. For example:

```typescript
{
    label: "Some Page", // Display label in the navigation
    href: "/page", // route path, will be prefixed with the module basePath
    icon: SomeIconComponent, // optional icon component from react-icons
    location: "dashboard" | "public" | "admin",
    children: [ ... ] // optional sub-navigation items
}
```

## Common & Infra

Any contribution to `./common` must have at least one approval from any team member, after through code review.

Any contribution to `./infra` must have at least one approval from Aaron the tech-lead, after through code review.
