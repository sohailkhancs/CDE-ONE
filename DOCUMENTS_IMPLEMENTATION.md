# Documents Tab Implementation - ISO 19650 Compliant

## Summary
Fully functional Documents tab with ISO 19650 compliant upload functionality. The implementation includes a professional upload modal, workflow transitions, and complete API integration.

## Changes Made

### Frontend Components

#### 1. UploadModal Component (`src/features/documents/components/UploadModal.tsx`)
- **Drag & Drop File Upload**: Modern drag-and-drop interface with visual feedback
- **ISO 19650 Metadata Fields**:
  - Container Type (D1, D2, M1, M2, M3, C1, P1, R1)
  - Discipline (Architecture, Structural, MEP, Civil, etc.)
  - Originator code
  - Volume/Level classification
  - Uniclass 2015 classification
- **Auto-generated Container ID**: Follows ISO 19650 naming convention
- **Form Validation**: Real-time validation with error messages
- **Upload Progress**: Visual progress indicator
- **ISO 19650 Workflow Info**: Status explanation (S0 through S5)

#### 2. Documents Page Updates (`src/features/documents/routes/Documents.tsx`)
- **Upload Modal Integration**: Added upload button that opens modal
- **Workflow Transitions**: Added promote button to document sidebar
- **Delete Functionality**: Added delete button with confirmation
- **Real-time Updates**: Documents refresh after upload/delete/promote
- **Loading States**: Proper loading indicators for all operations

#### 3. API Integration (`src/features/documents/api/documentsService.ts`)
- **USE_MOCK = false**: Switched from mock to real API
- **File Upload**: Handles FormData with file and metadata
- **Document Operations**: getAll, getById, upload, update, delete, promote, download

#### 4. Authentication (`src/features/auth/AuthProvider.tsx`)
- **USE_MOCK_AUTH = false**: Now uses real JWT authentication from backend

### Backend Updates

#### 1. Documents Router (`backend/app/routers/documents.py`)
- **File Upload Endpoint**: Accepts multipart/form-data with file and ISO 19650 metadata
- **File Storage**: Saves uploaded files to `uploads/` directory
- **File Size Calculation**: Automatically calculates and stores file size
- **Download Endpoint**: Returns file for download with proper headers
- **Workflow Transition**: Supports promotion through ISO 19650 states (S0 → S1 → S2 → S3 → S4 → S5)

#### 2. Configuration (`backend/.gitignore`)
- **Uploads Directory**: Added `uploads/` to gitignore

## ISO 19650 Standards Compliance

### Container Types (per ISO 19650)
| Code | Name | Description |
|------|------|-------------|
| D1 | 2D Drawing | Traditional 2D CAD drawings |
| D2 | 2D Drawing - PDF | PDF format drawings |
| M1 | 2D Model | 2D intelligent model |
| M2 | 3D Model | 3D geometric model |
| M3 | 3D Model - FC | Federated 3D model |
| C1 | Catalogue | Product catalogue data |
| P1 | Performance | Performance data |
| R1 | Report | Report documents |

### Workflow Status Codes
| Code | Name | Description |
|------|------|-------------|
| S0 | Work in Progress | Initial draft, not for distribution |
| S1 | Tender | For tender/pricing purposes |
| S2 | Construction | Approved for construction |
| S3 | Information Approval | Pending client approval |
| S4 | Suitable for Construction | Final approved version |
| S5 | Archived | Project archive status |

### Disciplines/Roles
| Code | Name | Originator |
|------|------|------------|
| ARC | Architecture | A |
| STR | Structural | S |
| MEP | MEP | M |
| CIV | Civil | C |
| FIR | Fire Protection | F |
| HVA | HVAC | H |
| ELC | Electrical | E |
| PLU | Plumbing | P |

## Usage

### 1. Upload a Document
1. Click the "Upload" button in the Documents tab
2. Drag & drop a file or click "Browse Files"
3. Fill in required metadata:
   - Document Name (format: XX-NNN_Description)
   - Discipline
   - Container Type
   - Description (optional)
4. Review auto-generated Container ID
5. Click "Upload Container"

### 2. Promote Document Workflow
1. Select a document from the list
2. In the right sidebar, click "Promote"
3. Confirm the status transition
4. Document advances to next status (S0→S1→S2→S3→S4)

### 3. Delete Document
1. Select a document from the list
2. Click the trash icon in the sidebar
3. Confirm deletion

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/documents` | GET | Get all documents (with filters) |
| `/api/v1/documents` | POST | Upload new document (FormData) |
| `/api/v1/documents/{id}` | GET | Get single document |
| `/api/v1/documents/{id}` | PUT | Update document metadata |
| `/api/v1/documents/{id}` | DELETE | Delete document |
| `/api/v1/documents/{id}/workflow` | POST | Promote document workflow |
| `/api/v1/documents/{id}/download` | GET | Download document file |

## Environment Configuration

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:8000/api/v1
```

### Backend (.env)
```
DATABASE_URL=sqlite:///./cde_one.db
SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
FRONTEND_URL=http://localhost:5173
```

## Testing Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@skyline.com | admin123 | Admin |
| alex.m@skyline.com | pm123 | Project Manager |

## File Structure

```
src/features/documents/
├── components/
│   └── UploadModal.tsx       # ISO 19650 upload modal
├── api/
│   └── documentsService.ts   # API service layer
└── routes/
    └── Documents.tsx         # Main documents page

backend/
├── app/
│   ├── routers/
│   │   └── documents.py      # Document endpoints
│   ├── schemas/
│   │   └── document.py       # Pydantic schemas
│   └── models/
│       └── document.py       # Database models
└── uploads/                  # File storage (gitignored)
```

## Notes

- File uploads are stored in `backend/uploads/` directory
- Each uploaded file is saved with UUID as filename
- File size is automatically calculated and stored
- The system tracks document versions through workflow transitions
- Container IDs are auto-generated following ISO 19650: Originator-Volume-Level-Type-Timestamp
