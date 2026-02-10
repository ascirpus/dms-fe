# Current Document Management System Permission Structure

## Overview of Role & Permission Architecture

## Core Permission Concepts

### 1. Composite Permission Types (Binary Flags)
The system defines permissions as composite binary flags using bitwise operations:

- **VIEW**: 1 (binary: 001) - Ability to see documents
- **COMMENT**: 3 (binary: 011) - Ability to add comments to documents (includes VIEW)
- **DECIDE**: 7 (binary: 111) - Ability to approve/reject confirmable documents (includes VIEW and COMMENT)

### 2. Permission Hierarchy
Permissions are hierarchical and cumulative:
- **COMMENT** permission automatically includes **VIEW** permission
- **DECIDE** permission automatically includes both **VIEW** and **COMMENT** permissions
- Users with higher-level permissions inherit all lower-level capabilities

### 3. Core Permission Rules
- Being in a project grants basic access to view project documents
- Party affiliations determine specific document type permissions using composite flags
- User-specific overrides can grant or revoke specific permission combinations

## Permission Layers (Hierarchical Structure)

### 1. Project Membership (Base Layer)
- Managed through `project_users` table
- Grants basic document visibility within the project
- Required for any access to project documents

### 2. Party-Based Permissions (Role Layer)
- Users belong to "parties" within projects (e.g., contractors, clients, insurers)
- Each party can have specific composite permissions for specific document types
- Managed through `party_permissions` table with bitwise permission values
- Example: "Insurance company has VIEW permission (1) for damage reports but DECIDE permission (7) for insurance confirmations"

### 3. User-Specific Overrides (Exception Layer)
- Individual user permissions can override default and party-based rules using composite permission values
- Can grant or revoke permission combinations at project or document level
- Managed through `user_permissions` table with bitwise permission values
- Provides granular control for exceptional cases

## Document Access Control Flow

When a user attempts to access a document, the permission check follows this sequence:

1. **Is the user in the project?** (via `project_users`)
   - If no: Access denied
   - If yes: Continue to step 2

2. **Check for user-specific overrides** (via `user_permissions`)
   - If a document-specific override exists: Apply composite permission value
   - If a project-wide override exists: Apply composite permission value
   - If no overrides: Continue to step 3

3. **Check party-based permissions** (via `user_parties` and `party_permissions`)
   - Get all parties the user belongs to for this project
   - Combine permission values from all applicable parties using bitwise OR
   - Check if the combined permissions include the required permission using bitwise AND
   - If yes: Grant access
   - If no: Apply default permission rules

4. **Apply default permission rules**
   - VIEW: Default granted to all project members (permission value 1)
   - COMMENT: Default granted to all project members (permission value 3)
   - DECIDE: Default denied (permission value 0, only granted through party permissions)

## Permission Checking Logic

The system uses bitwise operations to check permissions:

```javascript
// Check if user has VIEW permission
hasViewPermission = (userPermissions & 1) == 1

// Check if user has COMMENT permission
hasCommentPermission = (userPermissions & 3) == 3

// Check if user has DECIDE permission
hasDecidePermission = (userPermissions & 7) == 7
```

## Document Type Permissions

Each document type has its own permission requirements using composite values:

1. **project_information**:
   - All parties can view (permission value ≥ 1)
   - Non-confirmable

2. **damage_report**:
   - Viewable by owner, management, and insurance parties (permission value ≥ 1)
   - Non-confirmable

3. **inventory_report**:
   - Standard permission rules apply
   - Non-confirmable

4. **quote**:
   - Requires approval (confirmable) - needs DECIDE permission (permission value = 7)
   - Approval limited to specific parties with DECIDE permissions

5. **confirmation**:
   - Non-confirmable
   - Standard permission rules apply

6. **hours_confirmation**:
   - Requires approval (confirmable) - needs DECIDE permission (permission value = 7)
   - Approval limited to specific parties with DECIDE permissions

7. **invoice**:
   - Non-confirmable
   - Standard permission rules apply

## Implementation Architecture

The system implements this permission structure through:

1. **Database Tables**:
   - `project_users`: Project membership
   - `user_parties`: Party affiliations within projects
   - `party_permissions`: Party-specific composite permissions for document types (stored as integer values)
   - `user_permissions`: User-specific composite permission overrides (stored as integer values)

2. **Permission Check Algorithm**:
   - Uses bitwise operations to evaluate composite permissions
   - Evaluates permissions from most specific to most general
   - Considers user overrides first, then party permissions, then defaults
   - Combines multiple party permissions using bitwise OR operations

3. **Integration with Auth System**:
   - Keycloak handles authentication
   - Application handles all authorization logic using composite permission values

## Benefits of Composite Permission System

- **Efficiency**: Single integer value represents multiple permission states
- **Consistency**: Higher permissions automatically include lower permissions
- **Scalability**: Easy to add new permission types by extending the binary flag system
- **Performance**: Bitwise operations are faster than multiple boolean checks