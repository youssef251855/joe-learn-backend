/**
 * Cloudinary and Multer Configuration (Simplified Method)
 *
 * This file sets up the Cloudinary SDK and configures multer for handling file uploads.
 * Cloudinary credentials are now hardcoded to simplify the setup process and remove 
 * the dependency on a .env file.
 */
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with hardcoded credentials.
cloudinary.config({
  cloud_name: 'dszqqhrjv',
  api_key: '593179499237439',
  api_secret: '4SN0tLHVVGP3b3C_KbUhM1sBOf4',
});

// Configure storage for videos on Cloudinary
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'joe-learn-videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi'],
  },
});

// Configure storage for assessment files (PDFs) on Cloudinary
const assessmentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'joe-learn-assessments',
    resource_type: 'raw', // Treat PDFs as raw files
    allowed_formats: ['pdf'],
  },
});

// Create multer instances with the respective storage configurations
const uploadVideo = multer({ storage: videoStorage });
const uploadAssessment = multer({ storage: assessmentStorage });

module.exports = {
  cloudinary,
  uploadVideo,
  uploadAssessment,
};