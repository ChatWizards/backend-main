const documentTypes = [
    'application/pdf',   // PDF
    'application/msword',   // Word Document (DOC)
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word Document (DOCX)
    'application/vnd.ms-excel',   // Excel Spreadsheet (XLS)
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel Spreadsheet (XLSX)
    'application/vnd.ms-powerpoint',   // PowerPoint Presentation (PPT)
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PowerPoint Presentation (PPTX)
    'text/plain',   // Text File (TXT)
    'application/rtf',   // Rich Text Format (RTF)
    'application/vnd.oasis.opendocument.text',   // Open Document Text (ODT)
    'application/vnd.oasis.opendocument.spreadsheet',   // Open Document Spreadsheet (ODS)
    'application/vnd.oasis.opendocument.presentation',   // Open Document Presentation (ODP)
    'text/html',   // HTML File (HTML)
    'text/markdown'  // Markdown File (MD)
];

const audioTypes = [
    'audio/mpeg',   // MP3
    'audio/wav',    // WAV
    'audio/ogg',    // OGG
    'audio/aac',    // AAC
    'audio/flac',   // FLAC
    'audio/mp4'     // M4A
  ];
  
  const videoTypes = [
    'video/mp4',         // MP4
    'video/x-msvideo',   // AVI
    'video/quicktime',   // MOV
    'video/x-ms-wmv',    // WMV
    'video/x-matroska',  // MKV
    'video/webm'         // WEBM
  ];

  const imageTypes = [
    'image/jpeg',   // JPEG
    'image/png',    // PNG
    'image/gif',    // GIF
    'image/bmp',    // BMP
    'image/webp',   // WebP
    'image/svg+xml' // SVG
  ];

  module.exports = {documentTypes,audioTypes,videoTypes,imageTypes}