# File Upload Setup - Digital Ocean Spaces Integration

This guide explains how to set up file upload functionality for bid documents and bid reports using Digital Ocean Spaces.

## Prerequisites

1. **Digital Ocean Account**: You need an active Digital Ocean account
2. **Digital Ocean Spaces**: Create a Space (bucket) for file storage
3. **CDN (Optional)**: Set up a CDN endpoint for faster file delivery

## Digital Ocean Spaces Setup

### 1. Create a Space

1. Log in to your Digital Ocean account
2. Go to **Spaces** in the sidebar
3. Click **Create a Space**
4. Choose a datacenter region close to your users
5. Set the Space name (e.g., `bidding-insights-files`)
6. Choose File Listing permissions:
   - **Public** if you want files to be publicly accessible
   - **Restricted** for private files (recommended for sensitive documents)

### 2. Generate Access Keys

1. Go to **API** → **Spaces access keys**
2. Click **Generate New Key**
3. Save the **Access Key** and **Secret Key** securely
4. These will be used in your environment variables

### 3. Set up CDN (Optional but Recommended)

1. In your Space settings, go to **Settings**
2. Enable **CDN**
3. Choose a custom subdomain or use the default
4. Note the CDN endpoint URL

## Environment Variables Configuration

Copy the `.env.example` file to `.env.local` and update the Digital Ocean Spaces configuration:

```bash
# Digital Ocean Spaces Configuration
DO_SPACES_ENDPOINT="https://fra1.digitaloceanspaces.com"  # Replace 'fra1' with your region
DO_SPACES_ACCESS_KEY="your_access_key_here"
DO_SPACES_SECRET_KEY="your_secret_key_here"
DO_SPACES_BUCKET="bidding-insights-files"  # Your Space name
DO_SPACES_CDN_URL="https://your-cdn-endpoint.fra1.cdn.digitaloceanspaces.com"  # Optional
```

### Region Endpoints

Common Digital Ocean Spaces regions:
- **New York 3**: `https://nyc3.digitaloceanspaces.com`
- **San Francisco 2**: `https://sfo2.digitaloceanspaces.com`
- **Amsterdam 3**: `https://ams3.digitaloceanspaces.com`
- **Singapore 1**: `https://sgp1.digitaloceanspaces.com`
- **Frankfurt 1**: `https://fra1.digitaloceanspaces.com`

## Features Implemented

### File Upload Component (`components/ui/file-upload.tsx`)

- **Drag & Drop Support**: Users can drag files directly onto the upload area
- **File Validation**: Automatically validates file type (PDF, DOC, DOCX) and size (max 10MB)
- **Progress Indicator**: Shows upload progress with a progress bar
- **Error Handling**: Displays clear error messages for invalid files or upload failures
- **File Preview**: Shows uploaded file with options to view or remove

### Supported File Types

- **PDF** (`.pdf`)
- **Microsoft Word** (`.doc`, `.docx`)
- **Maximum file size**: 10MB per file

### API Endpoints

#### `POST /api/upload`

Handles file uploads to Digital Ocean Spaces.

**Request Body** (FormData):
- `file`: The file to upload
- `fileType`: Either "document" or "report"

**Response**:
```json
{
  "success": true,
  "data": {
    "s3Key": "tender-documents/1638360000000-document.pdf",
    "cdnUrl": "https://your-cdn.com/tender-documents/1638360000000-document.pdf"
  }
}
```

## Usage in Tender Creation Form

The tender creation form now includes two file upload sections:

1. **Bid Document Upload**: For official tender documents
2. **Bid Report Upload**: For bid evaluation reports

### Database Storage

Files are stored with the following database fields:
- `bid_document_s3_key`: S3 key for the bid document
- `bid_document_cdn_url`: CDN URL for fast access
- `bid_report_s3_key`: S3 key for the bid report  
- `bid_report_cdn_url`: CDN URL for fast access

## Security Features

### Authentication & Authorization

- Only authenticated users can upload files
- Only **Admin** and **Government Official** users can upload files
- Session validation on every upload request

### File Validation

- File type validation (only PDF and Word documents)
- File size limits (10MB maximum)
- Sanitized filenames to prevent security issues

### Access Control

- Files are uploaded with `public-read` ACL for easy access
- Unique timestamped filenames prevent conflicts
- Organized folder structure (`tender-documents/`, `tender-reports/`)

## Folder Structure

Files are organized in the following structure:
```
your-space/
├── tender-documents/
│   ├── 1638360000000-document1.pdf
│   ├── 1638360000001-document2.docx
│   └── ...
└── tender-reports/
    ├── 1638360000000-report1.pdf
    ├── 1638360000001-report2.doc
    └── ...
```

## Troubleshooting

### Common Issues

1. **"Failed to upload file" error**
   - Check your Digital Ocean Spaces credentials
   - Verify the bucket name and region endpoint
   - Ensure the Space has proper permissions

2. **"File type not allowed" error**
   - Only PDF, DOC, and DOCX files are supported
   - Check the file extension and MIME type

3. **"File size too large" error**
   - Maximum file size is 10MB
   - Compress or split large files

### Testing the Setup

1. Go to `/dashboard/tenders/add`
2. Try uploading a PDF or Word document in the file upload areas
3. Check that the file appears in your Digital Ocean Space
4. Verify the CDN URL works by opening it in a browser

## Cost Considerations

- **Storage**: $0.02 per GB per month
- **Data Transfer**: $0.01 per GB for outbound transfer
- **CDN**: Additional costs for CDN usage (recommended for production)

For detailed pricing, check [Digital Ocean Spaces Pricing](https://www.digitalocean.com/pricing/spaces).
