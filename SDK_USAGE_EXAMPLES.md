# SDK Usage Examples

This document shows how to use the auto-generated type-safe SDK with React Query hooks.

## Prerequisites

Make sure you've generated the SDK:

```bash
npm run api:generate  # Generate OpenAPI spec from Zod schemas
npm run api:sdk       # Generate SDK with React Query hooks from spec
```

This creates `sdk/index.ts` with fully typed React Query hooks.

---

## Basic Usage

### 1. Setup React Query Provider

```tsx
// app/layout.tsx or pages/_app.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

### 2. Use Generated Hooks

#### GET Request - List Users

```tsx
// app/users/page.tsx
'use client';

import { useGetApiUsers } from '@/sdk';

export default function UsersPage() {
  const { data, isLoading, error } = useGetApiUsers();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Users ({data?.count})</h1>
      <ul>
        {data?.data?.map(user => (
          <li key={user._id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

#### POST Request - Create User

```tsx
// app/users/create/page.tsx
'use client';

import { useState } from 'react';
import { usePostApiUsers } from '@/sdk';

export default function CreateUserPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const createUser = usePostApiUsers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await createUser.mutateAsync({
        data: { name, email }
      });

      if (response.success) {
        alert('User created successfully!');
        setName('');
        setEmail('');
      }
    } catch (error) {
      alert('Failed to create user');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Name"
        required
      />
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
        required
      />
      <button type="submit" disabled={createUser.isPending}>
        {createUser.isPending ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}
```

---

## Advanced Patterns

### With Mutation Callbacks

```tsx
const createUser = usePostApiUsers({
  mutation: {
    onSuccess: data => {
      console.log('User created:', data);
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['api', 'users'] });
    },
    onError: error => {
      console.error('Failed to create user:', error);
    }
  }
});
```

### With Query Options

```tsx
const { data } = useGetApiUsers({
  query: {
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 60000, // Data stays fresh for 1 minute
    enabled: isAuthenticated // Conditional fetching
  }
});
```

### Manual Mutations

```tsx
import { postApiUsers } from '@/sdk';

async function createUserManually() {
  const response = await postApiUsers({
    name: 'John Doe',
    email: 'john@example.com'
  });

  return response;
}
```

---

## Type Safety Benefits

### 1. Request Type Inference

```tsx
// ✅ TypeScript knows the exact shape
const createUser = usePostApiUsers();

await createUser.mutateAsync({
  data: {
    name: 'John',
    email: 'john@example.com'
  }
});

// ❌ TypeScript error - invalid field
await createUser.mutateAsync({
  data: {
    name: 'John',
    invalidField: 'value' // Error: Object literal may only specify known properties
  }
});
```

### 2. Response Type Inference

```tsx
const { data } = useGetApiUsers();

// data is fully typed:
// {
//   success: true;
//   data: Array<{
//     _id: string;
//     name: string;
//     email: string;
//     createdAt: Date;
//     updatedAt: Date;
//   }>;
//   count: number;
// }

// ✅ Autocomplete works
console.log(data?.data?.[0]?.name);

// ❌ TypeScript error - property doesn't exist
console.log(data?.data?.[0]?.invalidField);
```

---

## Health Check Example

```tsx
'use client';

import { useGetApiHealth } from '@/sdk';

export default function HealthCheck() {
  const { data, isLoading } = useGetApiHealth({
    query: {
      refetchInterval: 30000 // Check every 30 seconds
    }
  });

  return (
    <div>
      <h2>System Health</h2>
      <p>Status: {data?.status}</p>
      <p>Uptime: {data?.uptime}s</p>
      {data?.checks && (
        <div>
          <h3>Component Checks:</h3>
          <ul>
            {Object.entries(data.checks).map(([name, check]) => (
              <li key={name}>
                {name}: {check.status} - {check.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

## Custom Hook Wrapper

Create reusable hooks for common operations:

```tsx
// hooks/useUsers.ts
import { useGetApiUsers, usePostApiUsers } from '@/sdk';
import { useQueryClient } from '@tanstack/react-query';

export function useUsers() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useGetApiUsers();

  const createUser = usePostApiUsers({
    mutation: {
      onSuccess: () => {
        // Auto-refresh list after creating user
        queryClient.invalidateQueries({ queryKey: ['api', 'users'] });
      }
    }
  });

  return {
    users: data?.data ?? [],
    count: data?.count ?? 0,
    isLoading,
    error,
    createUser: createUser.mutateAsync,
    isCreating: createUser.isPending
  };
}

// Usage in component
function MyComponent() {
  const { users, isLoading, createUser } = useUsers();

  // ...
}
```

---

## Error Handling

```tsx
const { data, error } = useGetApiUsers();

if (error) {
  // Error object from fetch
  const status = error.response?.status;
  const message = error.response?.data?.error || error.message;

  return (
    <div className="error">
      <h3>Error {status}</h3>
      <p>{message}</p>
    </div>
  );
}
```

---

## Loading States

```tsx
function UsersList() {
  const { data, isLoading, isFetching, isRefetching } = useGetApiUsers();

  return (
    <div>
      {isLoading && <p>Initial load...</p>}
      {isFetching && !isRefetching && <p>Fetching...</p>}
      {isRefetching && <p>Refreshing...</p>}

      {data && (
        <ul>
          {data.data.map(user => (
            <li key={user._id}>{user.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## Optimistic Updates

```tsx
const queryClient = useQueryClient();

const createUser = usePostApiUsers({
  mutation: {
    onMutate: async newUser => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['api', 'users'] });

      // Snapshot previous value
      const previousUsers = queryClient.getQueryData(['api', 'users']);

      // Optimistically update
      queryClient.setQueryData(['api', 'users'], (old: any) => ({
        ...old,
        data: [...(old?.data ?? []), newUser],
        count: (old?.count ?? 0) + 1
      }));

      return { previousUsers };
    },
    onError: (err, newUser, context) => {
      // Rollback on error
      queryClient.setQueryData(['api', 'users'], context?.previousUsers);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['api', 'users'] });
    }
  }
});
```

---

## Benefits Summary

✅ **Type Safety**: Full TypeScript inference from API to frontend  
✅ **Auto-completion**: IDE suggestions for all API methods and types  
✅ **Compile-time Errors**: Catch API changes before runtime  
✅ **React Query Integration**: Caching, refetching, optimistic updates  
✅ **Zero Manual Typing**: Types generated automatically from OpenAPI spec  
✅ **Single Source of Truth**: Zod schemas → OpenAPI → SDK types

---

## Regenerating SDK

Whenever you change API schemas or routes:

```bash
npm run api:generate  # Update openapi.json
npm run api:sdk       # Regenerate SDK
```

Or use watch mode during development:

```bash
npm run api:watch     # Auto-regenerate on file changes
```

The SDK will automatically reflect all API changes! 🎉
