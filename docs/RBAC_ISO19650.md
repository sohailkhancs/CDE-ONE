# RBAC and ISO 19650 Implementation Guide

## Overview

CDE-ONE implements a comprehensive Role-Based Access Control (RBAC) system that complies with **ISO 19650:2018** (Organization and digitization of information about buildings and civil engineering works, including building information modelling (BIM)).

## Architecture

### Backend Components

1. **`app/core/rbac.py`** - Core RBAC logic and permission definitions
2. **`app/core/middleware.py`** - Authentication middleware, audit logging, and permission decorators
3. **`app/routers/auth.py`** - Authentication endpoints with security audit logging
4. **`app/routers/documents.py`** - Document endpoints with RBAC enforcement
5. **`app/routers/audit.py`** - Audit log management API

### Frontend Components

1. **`src/features/rbac/rbac.ts`** - RBAC utilities and permission checking
2. **`src/features/rbac/useRBAC.tsx`** - React hooks for RBAC
3. **`src/features/auth/AuthProvider.tsx`** - Authentication context with token management

## User Roles

### 1. Admin

**Description:** Full system access including user management and system configuration.

**Permissions:**
- `view` - View all documents and resources
- `download` - Download any document
- `upload` - Upload documents to any project
- `update` - Edit any document metadata
- `delete` - Delete any document (with audit trail)
- `promote` - Promote documents through workflow states
- `share` - Share documents with external parties

**Special Access:**
- View ALL WIP (S0) documents regardless of author
- Bypass all document ownership restrictions
- Access audit logs and security reports
- Manage user accounts and roles

### 2. Project Manager

**Description:** Project-level control for document management and workflow.

**Permissions:**
- `view` - View documents (excluding others' WIP)
- `download` - Download accessible documents
- `upload` - Upload documents to assigned projects
- `update` - Edit non-WIP documents
- `promote` - Promote documents through workflow
- `share` - Share documents within project

**Special Access:**
- View and manage published documents (S1-S5)
- Promote documents from WIP to shared states
- Coordinate document review processes
- Cannot delete documents

### 3. Viewer

**Description:** Read-only access for document review.

**Permissions:**
- `view` - View published documents only
- `download` - Download published documents

**Restrictions:**
- Cannot view WIP (S0) documents (except own)
- Cannot upload, edit, or delete
- Cannot promote documents
- Cannot share externally

## ISO 19650 Document Status Workflow

```
S0 (WIP) ──────┐
               │
               ├─── S1 (Tender/Shared)
               │
               ├─── S2 (Construction)
               │
               └─── S3 (Information Approval)

S1 (Tender) ────┬─── S2 (Construction)
               │
               ├─── S3 (Information Approval)
               │
               └─── S4 (Published)

S2 (Construction) ──── S3 (Information Approval)
                     │
                     └─── S4 (Published)

S3 (Information Approval) ──── S4 (Published)

S4 (Published) ──────────────── S5 (Archived)

S5 (Archived) ───────────────── [No transitions allowed]
```

### State Definitions

| Code | Status | Description |
|------|--------|-------------|
| S0 | Work in Progress | Initial draft, visible only to author and Admin |
| S1 | Tender/Shared | Shared for tender purposes, visible to all non-Admin users |
| S2 | Construction | Issued for construction, visible to all non-Admin users |
| S3 | Information Approval | Under approval review, visible to all non-Admin users |
| S4 | Published | Final published version, immutable without revision |
| S5 | Archived | Historical record, read-only |

## RBAC Rules by Document Status

### WIP (S0) Documents

| Role | Can View | Can Download | Can Update | Can Delete | Can Promote |
|------|----------|--------------|------------|------------|-------------|
| Admin | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All |
| Project Manager | ✅ Own only | ✅ Own only | ✅ Own only | ❌ | ✅ Own only |
| Viewer | ✅ Own only | ✅ Own only | ❌ | ❌ | ❌ |

### Published Documents (S1-S5)

| Role | Can View | Can Download | Can Update | Can Delete | Can Promote |
|------|----------|--------------|------------|------------|-------------|
| Admin | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All |
| Project Manager | ✅ All | ✅ All | ✅ All | ❌ | ✅ All |
| Viewer | ✅ All | ✅ All | ❌ | ❌ | ❌ |

## Audit Logging

All actions are logged for ISO 19650 compliance. Audit entries include:

- **Timestamp** - UTC ISO 8601 format
- **User Identity** - ID, email, and role
- **Action** - Type of action performed
- **Resource** - Type and ID of affected resource
- **Outcome** - Success/failure and HTTP status code
- **Details** - Additional context

### Logged Actions

#### Authentication
- `auth.login.success` - Successful user login
- `auth.login.failed` - Failed login attempt
- `auth.register.success` - New user registration
- `auth.logout` - User logout

#### Document Operations
- `document.view` - Document viewed
- `document.download` - Document downloaded
- `document.upload` - New document uploaded
- `document.update` - Document metadata updated
- `document.delete` - Document deleted
- `document.promote` - Document status changed

#### Permission Events
- `permission.denied` - Access denied
- `document.{action}.denied` - Specific document action denied

### Audit Log Storage

- **Location:** `audit_logs/` directory
- **Format:** JSON Lines (one JSON object per line)
- **Rotation:** Daily files named `audit_YYYYMMDD.log`
- **Retention:** Configure based on organizational policy

## Usage Examples

### Backend - Using Permission Decorators

```python
from app.core.middleware import require_permission, require_roles
from app.core.rbac import Permission, UserRole

# Require specific permission
@router.post("/documents")
async def upload_document(
    current_user: User = Depends(require_permission(Permission.UPLOAD))
):
    # User has upload permission
    pass

# Require specific roles
@router.delete("/documents/{doc_id}")
async def delete_document(
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    # User is Admin
    pass

# Using document-level permission check
@router.put("/documents/{doc_id}")
async def update_document(
    document_id: str,
    current_user: User = Depends(
        require_document_permission(Permission.UPDATE, "document_id")
    )
):
    # User can update this specific document
    pass
```

### Backend - Audit Logging

```python
from app.core.middleware import audit_log, AuditLogger

# Using audit_log function
audit_log(
    action="document.delete",
    user_id=current_user.id,
    user_email=current_user.email,
    user_role=current_user.role,
    resource_type="document",
    resource_id=document_id,
    details={"document_name": doc.name},
    success=True
)

# Using context manager for automatic success/failure tracking
with AuditLogger(
    action="document.upload",
    user=current_user,
    resource_type="document",
    resource_id=new_doc.id,
    details={"file_size": "2.5 MB"}
):
    # Perform operation
    # Audit log automatically written on success or exception
    upload_file(file)
```

### Frontend - Using RBAC Hooks

```typescript
import { usePermissions, useDocumentAccess } from '@/features/rbac';

function DocumentActions({ document }) {
  const { can } = usePermissions();
  const { canUpdate, canDelete, canPromote } = useDocumentAccess(
    document.status,
    document.authorId
  );

  return (
    <>
      {can('download') && <DownloadButton />}
      {canUpdate && <EditButton />}
      {canDelete && <DeleteButton />}
      {canPromote('S4') && <PublishButton />}
    </>
  );
}
```

### Frontend - Using Permission Gates

```typescript
import { PermissionGate, RoleGate } from '@/features/rbac';

// Permission-based rendering
<PermissionGate
  user={user}
  permission="delete"
  fallback={<span>Insufficient permissions</span>}
>
  <DeleteButton />
</PermissionGate>

// Role-based rendering
<RoleGate
  user={user}
  roles={['Admin', 'Project Manager']}
>
  <AdminPanel />
</RoleGate>
```

### Frontend - Document Filtering

```typescript
import { useDocumentFilter } from '@/features/rbac';

function DocumentList({ allDocuments }) {
  const { filterDocuments } = useDocumentFilter();

  const visibleDocuments = filterDocuments(allDocuments);

  return (
    <table>
      {visibleDocuments.map(doc => (
        <DocumentRow key={doc.id} document={doc} />
      ))}
    </table>
  );
}
```

## ISO 19650 Compliance Checklist

### Document Management
- ✅ Document lifecycle states (S0-S5)
- ✅ State transition validation
- ✅ Version numbering (P-series → C-series)
- ✅ Container types (M3, D1, C1, etc.)
- ✅ Originator codes
- ✅ Discipline classification

### Access Control
- ✅ Role-based permissions
- ✅ Document ownership tracking
- ✅ WIP document visibility restrictions
- ✅ Permission inheritance

### Audit Trail
- ✅ All document accesses logged
- ✅ All modifications tracked
- ✅ Authentication events recorded
- ✅ Permission denials logged
- ✅ User identity in all logs

### Security
- ✅ JWT-based authentication
- ✅ Token expiration and refresh
- ✅ Password hashing with bcrypt
- ✅ CORS configuration
- ✅ SQL injection prevention via ORM

## Default Credentials

After running `python backend/init_db.py`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@skyline.com | admin123 |
| Project Manager | alex.m@skyline.com | pm123 |

## Testing RBAC

1. **Test Admin Access:**
   - Login as admin@skyline.com
   - Should see all documents including WIP
   - Should be able to delete any document

2. **Test PM Access:**
   - Login as alex.m@skyline.com
   - Should see published documents + own WIP
   - Should not be able to delete

3. **Test Viewer Access:**
   - Create a viewer user
   - Should only see published documents
   - Should not have upload/edit/delete options

## Troubleshooting

### Login Issues

If login fails with correct credentials:

1. Check database has been initialized: `python backend/init_db.py`
2. Verify API URL in `.env.local` matches backend
3. Check browser console for API errors
4. Verify JWT secret in backend `.env`

### RBAC Not Working

If permissions seem incorrect:

1. Check user role in response from `/api/v1/auth/me`
2. Verify document status in database
3. Check `audit_logs/` for permission denials
4. Review RBAC rules in `app/core/rbac.py`

### Audit Logs Not Appearing

If audit logs are missing:

1. Ensure `audit_logs/` directory exists
2. Check write permissions on directory
3. Verify `AUDIT_LOG_DIR` in code
4. Check server logs for errors

## Security Best Practices

1. **Change default passwords** immediately after deployment
2. **Rotate JWT secrets** regularly
3. **Enable HTTPS** in production
4. **Set appropriate token expiration times**
5. **Implement rate limiting** on authentication endpoints
6. **Review audit logs** regularly for suspicious activity
7. **Backup audit logs** to secure, tamper-proof storage
8. **Implement IP whitelisting** for admin access

## References

- ISO 19650-1:2018 - Concepts and principles
- ISO 19650-2:2018 - Delivery phase of the assets
- BS EN ISO 19650-3:2020 - Operational phase of the assets
- OWASP Top 10 - Security considerations
